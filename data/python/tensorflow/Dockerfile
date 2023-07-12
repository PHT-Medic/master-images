FROM nvcr.io/nvidia/tensorflow:23.06-tf2-py3

RUN apt-get update -yqq && \
    apt-get dist-upgrade -yqq && \
    pip3 install numpy==1.23 && \
    pip3 install tensorflow && \
    pip3 install git+https://github.com/PHT-Medic/train-container-library.git
