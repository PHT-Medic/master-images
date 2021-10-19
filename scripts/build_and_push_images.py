import docker
import os
import typing
import os.path


def build_images():
    client = docker.from_env()
    registry = os.getenv("CONTAINER_REGISTRY")
    username = os.getenv("REGISTRY_USER")
    password = os.getenv("REGISTRY_PASSWORD")
    login_result = client.login(registry=registry, username=username, password=password)
    print(f"Login result: {login_result}")
    process_docker_image_dir("./language", client, registry)
    process_docker_image_dir("./custom", client, registry)


def process_docker_image_dir(directory, client, registry):
    sub_directories = scandir(directory)
    for sub_dir in sub_directories:
        repository_parts = sub_dir.split(os.sep)[1:]
        if len(repository_parts) >= 2:
            repository_name = "/".join(repository_parts)
            repository_name = registry + "/master/" + repository_name
            build_path = os.path.abspath(sub_dir)

            print(f"Building image <{repository_name}> at path <{build_path}>")
            image, logs = client.images.build(path=build_path, tag=repository_name + ":latest")
            for item in logs:
                print(item)
            # push the image to the registry
            for line in client.api.push(repository=repository_name, tag="latest", stream=True, decode=True):
                print(line)


def scandir(start_dir) -> typing.List[typing.Tuple[str, str]]:
    subfolders = [f.path for f in os.scandir(start_dir) if f.is_dir()]
    for dir in list(subfolders):
        subfolders.extend(scandir(dir))
    return subfolders


if __name__ == '__main__':
    build_images()
