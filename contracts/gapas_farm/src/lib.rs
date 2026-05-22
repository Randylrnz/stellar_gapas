#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype,
    Address, Env, Symbol, token, symbol_short
};

#[contracttype]
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum FarmStatus {
    Active = 0,
    Funded = 1,
    Harvesting = 2,
    Completed = 3,
    Cancelled = 4,
}

#[contracttype]
#[derive(Clone, Debug)]
pub struct FarmState {
    pub farmer: Address,
    pub funding_goal: i128,
    pub current_funding: i128,
    pub expected_return_bps: u32,       // basis points (e.g., 1800 = 18%)
    pub cooperative_wallet: Option<Address>,
    pub cooperative_enabled: bool,
    pub status: FarmStatus,
}

#[contract]
pub struct GapasFarmContract;

#[contractimpl]
impl GapasFarmContract {
    /// Initialize a new farm escrow contract
    pub fn initialize(
        env: Env,
        farmer: Address,
        funding_goal: i128,
        expected_return_bps: u32,
        _duration_days: u32,
        cooperative_wallet: Option<Address>,
    ) -> bool {
        farmer.require_auth();

        let farm_state = FarmState {
            farmer: farmer.clone(),
            funding_goal,
            current_funding: 0,
            expected_return_bps,
            cooperative_wallet: cooperative_wallet.clone(),
            cooperative_enabled: cooperative_wallet.is_some(),
            status: FarmStatus::Active,
        };

        env.storage().instance().set(&symbol_short!("FARM"), &farm_state);
        true
    }

    /// Investor funds the farm with USDC
    pub fn fund_farm(
        env: Env,
        investor: Address,
        amount: i128,
        usdc_token: Address,
    ) -> bool {
        investor.require_auth();

        let mut state: FarmState = env.storage().instance().get(&symbol_short!("FARM")).unwrap();

        // Validate amount and status
        assert!(amount > 0, "Amount must be positive");
        assert!(matches!(state.status, FarmStatus::Active), "Farm not active");
        assert!(
            state.current_funding + amount <= state.funding_goal,
            "Exceeds funding goal"
        );

        // Transfer USDC from investor to contract
        let token_client = token::Client::new(&env, &usdc_token);
        token_client.transfer(&investor, &env.current_contract_address(), &amount);

        // Record investment
        state.current_funding += amount;
        if state.current_funding >= state.funding_goal {
            state.status = FarmStatus::Funded;
        }

        env.storage().instance().set(&symbol_short!("FARM"), &state);

        // Record individual investor's contribution on-chain
        let mut investor_balance: i128 = env.storage().persistent().get(&investor).unwrap_or(0);
        investor_balance += amount;
        env.storage().persistent().set(&investor, &investor_balance);

        true
    }

    /// Get current funding state
    pub fn get_funding(env: Env) -> FarmState {
        env.storage().instance().get(&symbol_short!("FARM")).unwrap()
    }

    /// Get on-chain balance funded by a specific investor
    pub fn get_investor_funding(env: Env, investor: Address) -> i128 {
        env.storage().persistent().get(&investor).unwrap_or(0)
    }

    /// Distribute profit after harvest
    /// WITH cooperative (cooperative_enabled = true):
    ///   - Farmer: 69%
    ///   - Investors: 30% (simplified for direct payout)
    ///   - Cooperative: 1%
    ///
    /// WITHOUT cooperative:
    ///   - Farmer: 70%
    ///   - Investors: 30%
    pub fn distribute_profit(
        env: Env,
        total_profit: i128,
        usdc_token: Address,
        caller: Address,
    ) -> bool {
        caller.require_auth();

        let state: FarmState = env.storage().instance().get(&symbol_short!("FARM")).unwrap();
        let token_client = token::Client::new(&env, &usdc_token);
        let contract_addr = env.current_contract_address();

        if state.cooperative_enabled {
            // 69-30-1 split
            let farmer_share = total_profit * 69 / 100;
            let investor_pool = total_profit * 30 / 100;
            let coop_share = total_profit - farmer_share - investor_pool; // 1%

            // Pay farmer
            token_client.transfer(&contract_addr, &state.farmer, &farmer_share);

            // Pay cooperative
            if let Some(coop_wallet) = &state.cooperative_wallet {
                token_client.transfer(&contract_addr, coop_wallet, &coop_share);
            }

            // Distribute investor share (refund or pay to the distributor caller)
            token_client.transfer(&contract_addr, &caller, &investor_pool);
        } else {
            // 70-30 split (no cooperative)
            let farmer_share = total_profit * 70 / 100;
            let investor_pool = total_profit - farmer_share; // 30%

            token_client.transfer(&contract_addr, &state.farmer, &farmer_share);
            token_client.transfer(&contract_addr, &caller, &investor_pool);
        }

        true
    }
}
