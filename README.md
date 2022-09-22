<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

# Teslo API

1. Clonar proyecto del repositorio.
2. Ejecutar el comando para descargar dependencias necesarias del proyecto.

```
yarn install
```

3. Crear archivo de variables de entorno con el nombre **.env**.
4. Configurar las variables de entorno que se encuentrar en el archivo **.env.template** en el archivo que se creo **.env**.
5. Ejecutar el comando que levanta la base de datos de postgres

```
docker-compose up -d
```

6. Ejecutar el seed para llenar la base de datos con informacion de prueba.

```
http://localhost:3000/api/seed
```

7. Levantar el proyecto en modo desarrollo con el comando:

```
yarn start:dev
```
