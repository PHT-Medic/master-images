# credit https://github.com/civisanalytics/datascience-r
FROM rocker/verse
MAINTAINER marius.herr@uni-tuebingen.de

RUN DEBIAN_FRONTEND=noninteractive apt-get update -y --no-install-recommends && \
    apt-get install -y --no-install-recommends \
        curl \
        libudunits2-dev \
        libcairo-dev \
        libgdal-dev \
        libgeos-dev \
        libglu1-mesa-dev \
        libsodium-dev \
        libx11-dev \
        mesa-common-dev \
        python3-pip \
        python3-setuptools \
        git \
        wget && \
    apt-get clean -y && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# tuck the python client here just in case
RUN pip3 install git+https://github.com/PHT-Medic/train-container-library.git && \
    rm -rf ~/.cache/pip

COPY ./requirements.txt /tmp/requirements.txt

RUN Rscript -e 'install.packages(readLines("/tmp/requirements.txt"))'

# install civis api client
RUN Rscript -e 'install.packages("civis")'

ENV VERSION=4.0.4 \
    VERSION_MAJOR=4 \
    VERSION_MINOR=0 \
    VERSION_MICRO=4
