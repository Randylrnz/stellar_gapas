#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String};

#[contracttype]
#[derive(Clone, Debug)]
pub struct FarmerProfile {
    pub name: String,
    pub location: String,
    pub compliance_score: u32,
    pub land_verified: bool,
    pub is_verified: bool,
}

#[contract]
pub struct GapasRegistryContract;

#[contractimpl]
impl GapasRegistryContract {
    /// Register a new farmer profile in G.A.P.A.S. platform
    pub fn register_farmer(env: Env, farmer: Address, name: String, location: String) -> bool {
        farmer.require_auth();

        let profile = FarmerProfile {
            name,
            location,
            compliance_score: 85, // Default base compliance/credit score for registered growers
            land_verified: false,
            is_verified: false,
        };

        env.storage().persistent().set(&farmer, &profile);
        true
    }

    /// Verify a farmer's KYC, set compliance score and verify land ownership credentials
    pub fn verify_kyc(
        env: Env,
        farmer: Address,
        compliance_score: u32,
        land_verified: bool,
    ) -> bool {
        // Fetch existing profile or create a default one
        let mut profile: FarmerProfile = env.storage().persistent().get(&farmer).unwrap_or_else(|| {
            FarmerProfile {
                name: String::from_str(&env, "Anonymous Grower"),
                location: String::from_str(&env, "Unknown Location"),
                compliance_score: 0,
                land_verified: false,
                is_verified: false,
            }
        });
        
        profile.compliance_score = compliance_score;
        profile.land_verified = land_verified;
        
        // Verified if they have a strong compliance score and verified land ownership
        profile.is_verified = compliance_score >= 90 && land_verified;

        env.storage().persistent().set(&farmer, &profile);
        true
    }

    /// Query farmer's KYC profile
    pub fn get_farmer(env: Env, farmer: Address) -> Option<FarmerProfile> {
        env.storage().persistent().get(&farmer)
    }
}
