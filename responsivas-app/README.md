#
Sistema Responsivas IG

# Levantar Frontend //En la carpeta del front
npm run dev

# Levantar Frontend //en servidor linux para exponer el puerto
npm run dev -- --host


# Levantar Backend //en la carpeta del backend
node app.js

# Levantar Docker-Compose //en la carpeta principal o donde se encuentre
docker-compose up: Crear los contenedores (servicios) que están descritos en el docker-compose.yml.
docker-compose --env-file backend/.env up -d: Levanta los contenedores en segundo plano.
