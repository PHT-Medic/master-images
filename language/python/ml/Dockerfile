FROM python:3.9

RUN apt-get update -yqq && \
    apt-get dist-upgrade -yqq && \
    apt-get install -yqq git && \
    pip3 install git+https://github.com/PHT-Medic/train-container-library.git

COPY ./requirements.txt /tmp/requirements.txt

RUN pip3 install -r /tmp/requirements.txt
