use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint::ProgramResult,
    msg,
    program::{invoke, invoke_signed},
    program_error::ProgramError,
    program_pack::{IsInitialized, Pack},
    pubkey::Pubkey,
    sysvar::{rent::Rent, Sysvar},
};

use spl_token::state::Account as TokenAccount;

use crate::{error::QuestError, instruction::QuestInstruction, state::Quest};

pub struct Processor;
impl Processor {
    // 'instruction=0, amount=100'
    pub fn process(
        program_id: &Pubkey,
        accounts: &[AccountInfo],
        instruction_data: &[u8],
    ) -> ProgramResult {
        let instruction = QuestInstruction::unpack(instruction_data)?;

        match instruction {
            QuestInstruction::QuestCreate { amount } => {
                msg!("Instruction: QuestCreate");
                Self::_process_create_quest(program_id, accounts, amount)
            }

            QuestInstruction::QuestClaim { amount } => {
                msg!("Instruction: QuestClaim");
                Self::_process_quest_claim(program_id, accounts, amount)
            }
        }
    }

    fn _process_create_quest(
        program_id: &Pubkey,
        accounts: &[AccountInfo],
        amount: u64,
    ) -> ProgramResult {
        let account_info_iter = &mut accounts.iter(); //  accounts

        let publisher = next_account_info(account_info_iter)?; // 1, publisher account

        if !publisher.is_signer {
            return Err(ProgramError::MissingRequiredSignature);
        }

        let quest_token_account = next_account_info(account_info_iter)?; // 2 alice quest ata usdt account
        let quest_account = next_account_info(account_info_iter)?; // 3 alice quest account

        let rent = &Rent::from_account_info(next_account_info(account_info_iter)?)?; // 4 rent account

        if !rent.is_exempt(quest_account.lamports(), quest_account.data_len()) {
            return Err(QuestError::NotRentExempt.into());
        }

        let mut quest_info = Quest::unpack_unchecked(&quest_account.try_borrow_data()?)?;
        if quest_info.is_initialized() {
            return Err(ProgramError::AccountAlreadyInitialized);
        }

        quest_info.is_initialized = true;
        quest_info.publisher_pubkey = *publisher.key; // alice pub key
        quest_info.quest_ata_pubkey = *quest_token_account.key; //

        Quest::pack(quest_info, &mut quest_account.try_borrow_mut_data()?)?;

        // token program
        let token_program = next_account_info(account_info_iter)?; // 5, token program

        let (pda, _nonce) = Pubkey::find_program_address(&[b"quest"], program_id);

        // transfer token account ownership from publisher to quest pda
        let owner_change_ix = spl_token::instruction::set_authority(
            token_program.key,                                   // token_program_id
            quest_token_account.key,                             // owned_pubkey program_id
            Some(&pda),                                          // new_authority_pubkey
            spl_token::instruction::AuthorityType::AccountOwner, // authority_type, 设置令牌帐户的所有者
            publisher.key,                                       // owner_pubkey
            &[&publisher.key],                                   // signer_pubkeys
        )?;

        msg!("Calling the token program to transfer token account ownership...");
        invoke(
            &owner_change_ix,
            &[
                quest_token_account.clone(),
                publisher.clone(),
                token_program.clone(),
            ],
        )?;

        Ok(())
    }

    fn _process_quest_claim(
        program_id: &Pubkey,
        accounts: &[AccountInfo],
        amount: u64,
    ) -> ProgramResult {
        let account_info_iter = &mut accounts.iter();

        let receiver = next_account_info(account_info_iter)?; // 第 1 账户

        if !receiver.is_signer {
            return Err(ProgramError::MissingRequiredSignature);
        }

        let receive_account = next_account_info(account_info_iter)?; // 第 3 账户
        let receive_pubkey = receive_account.key;

        let quest_ata_account = next_account_info(account_info_iter)?; // 第 4 账户

        let quest_ata_info = TokenAccount::unpack(&quest_ata_account.try_borrow_data()?)?;

        if amount > quest_ata_info.amount {
            return Err(QuestError::ExpectedAmountMismatch.into());
        }

        let publisher = next_account_info(account_info_iter)?; // 第 5 账户, alice pubkey

        let quest_account = next_account_info(account_info_iter)?; // 第 7 账户

        let mut quest_info = Quest::unpack(&quest_account.try_borrow_data()?)?;

        if quest_info.quest_ata_pubkey != *quest_ata_account.key {
            return Err(ProgramError::InvalidAccountData);
        }

        if quest_info.publisher_pubkey != *publisher.key {
            return Err(ProgramError::InvalidAccountData);
        }

        let token_program = next_account_info(account_info_iter)?; // 第 8 账户
        let pda_account = next_account_info(account_info_iter)?; // 第 9 账户

        let (pda, nonce) = Pubkey::find_program_address(&[b"quest"], program_id);

        // transfer x token from alice to bob
        let transfer_to_taker_ix = spl_token::instruction::transfer(
            token_program.key,
            quest_ata_account.key,
            receive_pubkey,
            &pda,
            &[&pda],
            amount,
        )?;

        msg!("Calling the token program to transfer tokens to the claimer ...");
        invoke_signed(
            &transfer_to_taker_ix,
            &[
                quest_ata_account.clone(),
                receive_account.clone(),
                pda_account.clone(),
                token_program.clone(),
            ],
            &[&[&b"quest"[..], &[nonce]]],
        )?;

        msg!("checking close the quest account...");

        if amount == quest_ata_info.amount {
            **publisher.try_borrow_mut_lamports()? = publisher
                .lamports()
                .checked_add(quest_account.lamports())
                .ok_or(QuestError::AmountOverflow)?;

            **quest_account.try_borrow_mut_lamports()? = 0;
            *quest_account.try_borrow_mut_data()? = &mut [];
        }

        Ok(())
    }
}
