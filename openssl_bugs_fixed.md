
### 



1. 下载

    wget https://www.openssl.org/source/openssl-1.1.1.tar.gz

2. 解压

    tar -zxvf openssl-1.1.1.tar.gz

3. 安装

    cd openssl-1.1.1a
    sudo ./config
    sudo make && sudo make install

4. 检验

    openssl version

5. Config 配置

    ```
        openssl: error while loading shared libraries:  libssl.so.1.1: cannot open shared object file: No such file or directory
    ```

    Path: /usr/local/bin/openssl

    echo "export LD_LIBRARY_PATH=/usr/local/bin" >> ~/.bashrc

    export LD_LIBRARY_PATH=/usr/local/bin

    echo $LD_LIBRARY_PATH

