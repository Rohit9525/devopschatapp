pipeline {
    agent any

    environment {
        DOCKER_IMAGE = "chatapp"
        CONTAINER_NAME = "chatcontainer"
        PORT = "3000:80"
    }

    stages {
        stage('Clone Repository') {
            steps {
                echo 'Cloning the repository...'
                git 'https://github.com/Rohit9525/devopschatapp.git'
            }
        }

        stage('Build Docker Image') {
            steps {
                echo 'Building Docker image...'
                script {
                    sh 'docker build -t ${DOCKER_IMAGE} .'
                }
            }
        }

        stage('Stop Existing Container') {
            steps {
                echo 'Stopping existing container if it is running...'
                script {
                    sh 'docker ps -q --filter "name=${CONTAINER_NAME}" | xargs -r docker stop'
                }
            }
        }

        stage('Start New Container') {
            steps {
                echo 'Starting the new container...'
                script {
                    sh 'docker ps -a -q --filter "name=${CONTAINER_NAME}" | xargs -r docker start || docker run -d --name ${CONTAINER_NAME} -p ${PORT} ${DOCKER_IMAGE}'
                }
            }
        }
    }

    post {
        always {
            echo 'Cleaning up workspace...'
            cleanWs()
        }
    }
}