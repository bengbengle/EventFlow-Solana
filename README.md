
# git add 


### install solana-cli

    sh -c "$(curl -sSfL https://release.solana.com/v1.14.18/install)"

### build

cargo build
cargo build-bpf



echo "export LD_LIBRARY_PATH=/usr/local/lib" >> ~/.bashrc

<!-- Warning: cargo-build-bpf is deprecated. Please, use cargo-build-sbf -->
cargo-build-sbf

<!-- version `OPENSSL_1_1_1' not found -->
<!-- https://blog.csdn.net/qq_44747572/article/details/121123713 -->

<!-- 
OPENSSL_INCLUDE_DIR=/usr/include/openssl cargo build --release
OPENSSL_INCLUDE_DIR=/usr/include/openssl cargo build-bpf 
-->


    sudo apt-get update && sudo apt install -y openssl 


### deploy contract


    solana program deploy ./target/deploy/quest.so 

    programId:
    CdWe9GhEPqGMKpZ3eh5gw4bsT4Xc6mnkVwusmwcB4LHY

### alice Pubkey
    GcmmpaFE9UBvEzxpfWXKff72ac7RdqhLjCVvosvdrLL1

### config 

    solana config set --url devnet

    Config File: /home/codespace/.config/solana/cli/config.yml
    RPC URL: https://api.devnet.solana.com 
    WebSocket URL: wss://api.devnet.solana.com/ (computed)
    Keypair Path: /home/codespace/.config/solana/id.json 
    Commitment: confirmed 

### new key

    solana-keygen recover 'prompt:?key=0/0' --outfile ~/.config/solana/id.json
    solana-keygen new -o /home/lyb/.config/solana/id.json
    Recovered pubkey `GKHd35wjzkW66UD8JfcGUMQH5h6QTTYAPchmKkQm1n8S`. Continue? (y/n): y
    Wrote recovered keypair to /home/codespace/.config/solana/id.json

    admin
    GKHd35wjzkW66UD8JfcGUMQH5h6QTTYAPchmKkQm1n8S
   
    alice 
    5jy338EHWoFN4VgRqFdnncCWjj4GuGe4u8ezszEugk19

    bob
    6pJ21HV81gDU9tSLhKn62gwNvUW6rBW9dgJtS4TNtBNZ

    

### transfer 



    solana transfer --from <KEYPAIR> <RECIPIENT_ACCOUNT_ADDRESS> 0.5 --allow-unfunded-recipient

    solana transfer \
        --from ../scripts/keys/bob.json 9GisUqmcU6Qndx8dbL7LkxLTtLhJ1Ws62E9B72CRphYs 0.5 \
        --allow-unfunded-recipient
    
    solana transfer \
        --from ../scripts/keys/admin.json 5jy338EHWoFN4VgRqFdnncCWjj4GuGe4u8ezszEugk19 0.5 \
        --allow-unfunded-recipient












