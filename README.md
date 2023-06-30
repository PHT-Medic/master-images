[![Master Workflow](https://github.com/PHT-Medic/master-images/workflows/main/badge.svg)](https://github.com/PHT-Medic/master-images)

# Master Images 💽
This repository contains all docker images, with which an analysis algorithm can be built.

**Table of Contents**

- [Structure](#structure)
- [Programing Languages](#programing-languages)
- [Contributing](#contributing)

## Structure

The **data** folder contains all master images.
Each master image is assigned to a group (Many-To-One).

Properties like `command`, `commandArguments` can be inherited by the last `image-group.json` file
in the folder hierarchy of the file path.

```json
{
    "id": "example",
    "name": "Example",
    "command": "/usr/bin/php",
    "commandArguments": []
}
```

These properties can also be defined/overwritten with a `image.json` file in the same directory as the `Dockerfile`.
The content can be the same as for an image group. An image is also identified by an `id` & `name`.

For further details, check out [docker-scan](https://github.com/tada5hi/docker-scan).

---

The `data` folder therefore contains programming language specific images.
On the other hand, the folder also contains master images which might be project specific or 
aren't aimed for a specific language.

## Programing Languages
The main supported programming languages at the moment are:
- Python
- R

But there is practically no limit, as long as the base image provides a command path to an existing compiler.

## Contributing
If you have any questions, regarding creating & integrating own master-images,
feel free to open an issue or start a [discussion](https://github.com/PHT-Medic/master-images/discussions).


## Adding a registry target
Add address and credentials to the repository sec


