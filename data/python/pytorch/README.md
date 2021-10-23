# Pytorch GPU image

Prebuilt python 3 image with the [train container library](https://github.com/PHT-Medic/train-container-library) and
gpu accelerated pytorch installed. 
To run the image using gpus use:
```shell
docker run --gpus all -it --rm -v local_dir:container_dir <registry>/master/pytorch:latest
```
