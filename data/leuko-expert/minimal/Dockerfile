FROM python:3.9

RUN apt-get update -yqq && \
    apt-get dist-upgrade -yqq && \
    apt-get install -yqq git

COPY requirements.txt /tmp/requirements.txt

RUN python3 -m pip install --upgrade pip
RUN pip3 install -r /tmp/requirements.txt
ENV OMP_NUM_THREADS=1
