#![no_std]
use soroban_sdk::{contract, contractimpl, Env};

#[contract]
pub struct GapasContract;

#[contractimpl]
impl GapasContract {
    pub fn hello(_env: Env) -> u32 {
        1
    }
}
