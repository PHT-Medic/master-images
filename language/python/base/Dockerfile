FROM ubuntu
MAINTAINER michael.graf@uni-tuebingen.de

RUN apt -y update && apt-get -y install software-properties-common && \
    add-apt-repository ppa:deadsnakes/ppa && apt -y update && \
    apt-get install -y python3.9 git && apt install python-is-python3 && apt install -y python3-pip
RUN pip3 install git+https://github.com/PHT-Medic/train-container-library.git
