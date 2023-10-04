FROM nvcr.io/nvidia/tensorflow:23.06-tf2-py3

RUN apt-get update -yqq && \
    apt-get dist-upgrade -yqq && \
    pip3 install git+https://github.com/PHT-Medic/train-container-library.git

COPY requirements.txt /tmp/requirements.txt

RUN python3 -m pip install --upgrade pip
RUN pip3 install -r /tmp/requirements.txt
