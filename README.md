# Projet Communautaire pour Étudiants

## Structure du Projet

Le projet est divisé en deux parties principales :
- `backend` : Contient l'API et la logique côté serveur
- `frontend` : Contient l'interface utilisateur React

## Prérequis

- Docker et Docker Compose (pour l'installation avec Docker)
- Node.js (pour le développement local)
- MySQL (pour le développement local sans Docker)

## Installation et Configuration avec Docker

1. Assurez-vous que Docker et Docker Compose sont installés sur votre machine.

2. Clonez le dépôt du projet :
   ```
   git clone https://github.com/malo-social-network/student-community.git
   cd student-community
   ```

3. Créez un fichier `.env` à la racine du projet avec le contenu suivant :
   ```
   DB_HOST=database
   DB_USER=root
   DB_PASSWORD=root_password
   DB_NAME=student_community
   JWT_SECRET=votre_secret_jwt
   ```
   Note : Ces valeurs doivent correspondre à celles définies dans votre `docker-compose.yml`.

4. Construisez et lancez les conteneurs Docker :
   ```
   docker-compose up --build
   ```

   Cette commande va créer et configurer automatiquement la base de données, ainsi que lancer le backend et le frontend.

5. L'application sera accessible aux adresses suivantes :
   - Frontend : http://localhost:80
   - Backend API : http://localhost:5000
   - Base de données MySQL : localhost:3306 (accessible depuis l'intérieur du réseau Docker)

Note : Lorsque vous utilisez Docker, la création manuelle de la base de données n'est pas nécessaire. Docker s'occupe de tout configurer selon les spécifications du `docker-compose.yml`.

## Installation et Configuration pour le Développement Local (Sans Docker)

Si vous préférez développer sans Docker, suivez ces étapes pour configurer votre environnement local :

### Création de la base de données MySQL

1. Assurez-vous que MySQL est installé et en cours d'exécution sur votre machine.

2. Connectez-vous à MySQL en tant qu'utilisateur root :
   ```
   mysql -u root -p
   ```

3. Créez la base de données et l'utilisateur :
   ```sql
   CREATE DATABASE student_community;
   CREATE USER 'votre_user'@'localhost' IDENTIFIED BY 'mot_de_passe';
   GRANT ALL PRIVILEGES ON student_community.* TO 'votre_user'@'localhost';
   FLUSH PRIVILEGES;
   EXIT;
   ```

   Remplacez 'votre_user' et 'mot_de_passe' par les valeurs que vous souhaitez utiliser.

### Backend

1. Naviguez vers le dossier `cd backend`
2. Installez les dépendances :
   ```
   npm i
   ```
3. Créez un fichier `.env` dans le dossier `backend` avec le contenu suivant :
   ```
   DB_HOST=localhost
   DB_USER=votre_user
   DB_PASSWORD=mot_de_passe
   DB_NAME=student_community
   JWT_SECRET=votre_secret_jwt
   ```
   Remplacez les valeurs par celles correspondant à votre configuration.

4. Lancez le serveur backend :
   ```
   npm start
   ```

### Frontend

1. Naviguez vers le dossier `cd frontend`
2. Installez les dépendances :
   ```
   npm i
   ```
3. Lancez l'application frontend :
   ```
   npm start
   ```

## Accès à l'Application en Développement Local

Une fois que le backend et le frontend sont lancés, vous pouvez accéder à l'application :

- Frontend : http://localhost:3000
- Backend API : http://localhost:5000
- Base de données MySQL : localhost:3306

## Tests

Des tests unitaires, des tests end-to-end et des tests de performance sont inclus dans le projet. Pour exécuter ces tests, utilisez les commandes appropriées dans les dossiers backend et frontend.

### Exécution des tests

Pour le backend :
```
cd backend
npm test
```

Pour le frontend :
```
cd frontend
npm test
```
