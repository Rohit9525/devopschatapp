pipeline {
    agent any

    environment {
        IMAGE_NAME = "devopschatapp"
        CONTAINER_NAME = "chatapp-container"

        // Hardcoded Firebase Environment Variables
        VITE_FIREBASE_API_KEY = "AIzaSyBozHsuJ707-bsq3e-mTCIdCGKZFtqN7y0"
        VITE_FIREBASE_AUTH_DOMAIN = "ocean-b2a6d.firebaseapp.com"
        VITE_FIREBASE_PROJECT_ID = "ocean-b2a6d"
        VITE_FIREBASE_STORAGE_BUCKET = "ocean-b2a6d.firebasestorage.app"
        VITE_FIREBASE_MESSAGING_SENDER_ID = "413194511016"
        VITE_FIREBASE_APP_ID = "1:413194511016:web:67685647c982c2f44bd89d"
    }

    stages {
        stage('Clone Repository') {
            steps {
                git 'https://github.com/Rohit9525/devopschatapp.git'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh """
                docker build --build-arg VITE_FIREBASE_API_KEY=${VITE_FIREBASE_API_KEY} \
                             --build-arg VITE_FIREBASE_AUTH_DOMAIN=${VITE_FIREBASE_AUTH_DOMAIN} \
                             --build-arg VITE_FIREBASE_PROJECT_ID=${VITE_FIREBASE_PROJECT_ID} \
                             --build-arg VITE_FIREBASE_STORAGE_BUCKET=${VITE_FIREBASE_STORAGE_BUCKET} \
                             --build-arg VITE_FIREBASE_MESSAGING_SENDER_ID=${VITE_FIREBASE_MESSAGING_SENDER_ID} \
                             --build-arg VITE_FIREBASE_APP_ID=${VITE_FIREBASE_APP_ID} \
                             -t ${IMAGE_NAME} .
                """
            }
        }

        stage('Run Container') {
            steps {
                sh """
                docker stop ${CONTAINER_NAME} || true
                docker rm ${CONTAINER_NAME} || true
                docker run -d --name ${CONTAINER_NAME} -p 80:3000 ${IMAGE_NAME}
                """
            }
        }
    }

    post {
        success {
            echo "Deployment Successful! App is running on http://localhost:80"
        }
        failure {
            echo "Deployment Failed! Check the logs."
        }
    }
}