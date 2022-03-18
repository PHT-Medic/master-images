FROM python:3.9

RUN apt-get update -yqq && \
    apt-get dist-upgrade -yqq && \
    apt-get install -yqq git && \
    pip3 install git+https://github.com/PHT-Medic/train-container-library.git


## Install all libraries
COPY requirement.txt /tmp/requirements.txt

RUN python3 -m pip install --upgrade pip
RUN pip3 install -r /tmp/requirements.txt




