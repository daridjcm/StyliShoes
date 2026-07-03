# Instalación y Despliegue
  - Prerrequisitos: Tener instalado localmente los siguientes softwares:
    1. Bun
    2. MariaDB
    3. Dbeaver (opcional)
    4. Git
    5. Se prefiere que utilice un entorno de Linux como WSL, maquina virtual o una distribución para ejecutar los comandos en el siguiente paso
  - Configurar el entorno: He dejado archivo `.env.example` para la configuración del entorno. 
  ```bash
  # Clonar repo (via HTTPS o SSH)
  # HTTPS
    git clone https://github.com/daridjcm/StyliShoes.git && cd StyliShoes/
  # SSH
    git clone git@github.com:daridjcm/StyliShoes.git && cd StyliShoes/

  # Instalar dependencias
    bun install
    bun run server.js

  # Configurar .env
    cp .env.example .env
    nano .env

  # Iniciar y verificar el servicio de MariaDB
  sudo systemctl start mariadb
  sudo systemctl status mariadb

  # Acceder a la consola de MariaDB
  sudo mariadb -u root -p   
  ```
  Una vez dentro de la consola interactiva MariaDB, ejecute el siguiente comando:
  
  ```sql
  CREATE DATABASE stylishoes;
  EXIT;   
  ```
  Al salir de la consola interactiva, inicie el servidor con el siguiente comando:
  ```bash
  bun run server.js
  ```