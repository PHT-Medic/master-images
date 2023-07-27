[![Master Workflow](https://github.com/PHT-Medic/master-images/workflows/main/badge.svg)](https://github.com/PHT-Medic/master-images)

# Master Images 💽
This repository contains all docker images, with which an analysis algorithm can be built.

**Table of Contents**

- [Usage](#usage)
- [Folder Structure](#folder-structure)
- [Contributing](#contributing)

## Usage
Master images can be developed or deployed by defining them in the `data` directory.
How this works can be looked up in detail [here](#folder-structure).

After a new master image is created it can be tested locally.
The following commands can be executed locally for this purpose.

`Latest`
```shell
$ npx master-images@latest --help
```

`Beta`
```shell
$ npx master-images@beta --help
```

The output should look like this:

```shell
Usage:
  $ master-images <command> [options]

Commands:
  list         List all images
  build [dir]  Build image(s)
  push [dir]   Push image(s)

For more info, run any command with the `--help` flag:
  $ master-images list --help
  $ master-images build --help
  $ master-images push --help

Options:
  --registry <registry>  Provide a registry
  -h, --help             Display this message
```

## Folder Structure

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

The main supported programming languages at the moment are:
- Python
- R

But there is practically no limit, as long as the base image provides a command path to an existing compiler.

## Contributing
If you have any questions, regarding creating & integrating own master-images,
feel free to open an issue or start a [discussion](https://github.com/PHT-Medic/master-images/discussions).


## Webhook

To set up a webhook for the [webhooks](https://github.com/adnanh/webhook) on the harbor instance, 
the following configuration should be used.
Here `<secret>`, `<registry>` and `<registryPath>` must be replaced with the appropriate values.

```json
[
  {
    "id": "master-images",
    "execute-command": "npx master-images@latest build -- --registry <registry> --registryPath <registryPath>",
    "trigger-rule": {
          "match": {
            "type": "payload-hash-sha1",
            "secret": "<secret>",
            "parameter": {
              "source": "header",
              "name": "X-Hub-Signature"
            }
          }
    }
  }
]
```

To register webhook as a service on the server create a service file `webhook.service` in
`/etc/systemd/system` directory with the following content

```bash
[Unit]
Description=Webhooks

[Service]
ExecStart=/usr/bin/webhook -hooks /opt/webhooks/hooks.json -hotreload

[Install]
WantedBy=multi-user.target
```

Usage with systemctl:
- `systemctl enable webhook.service` to enable the newly created service
- `systemctl start webhook.service` to start the service
Now check the service status using `service webhook status`

Hook Address http://<ip>:9000/hooks/master-images
