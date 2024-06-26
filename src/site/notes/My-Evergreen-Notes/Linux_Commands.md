---
dg-publish: true
---
- `wget`: Internet downloader
    - Flags/Options
    - Examples
        - `wget "${RASPIOS_DOWNLOAD_URL}" -P "${official_img_dir}"`
- `curl` v.s `ping`
    - `curl -L https://raw.githubusercontent.com/gitbls/sdm/master/EZsdmInstaller`
- `unxz`
    - Flags/Options
    - Examples
        - `--keep "${official_img_dir}${official_img_xz_file}"`
- `crontab`
    - Flags/Options
        - `-e`
    - Examples
- `dpkg`
    - Flags/Options
        - `-l`
    - Examples
- `dd`
    - Flags/Options
    - Examples
- `df [options] [device_name or directory_name]`: Check disk space
    - Flags/Options
        - `-h`
        - `-H`
        - `-T`
        - `--output` or `--o`
        - `-m`
        - `-g`
    - Examples
- `dos2unix`: Convert the line endings from DOS/Windows format (CRLF) to Unix format (LF)
- `ls`
    - Flags/Options
        - `-l`: use a long listing format
    - Examples
- `unzip`
    - Flags/Options
    - Examples
        - Extract the archive's contents into a directory with the same name as the zip file
            - ...in the *current* working directory: `unzip file.zip`
            - ...in a *particular* destination folder: `unzip file.zip -d output_folder`
- `xargs [options] [command [initial-arguments]]`
    - xargs reads items from the standard input, delimited by blanks (which can be protected with double or single quotes or a backslash) or newlines, and executes the command (default is echo) one or more times with any initial-arguments followed by items read from standard input. Blank lines on the standard input are ignored.
    - [Use case](https://unix.stackexchange.com/questions/179851/using-a-file-to-install-packages-with-apt-get): using a file to install packages with `apt-get`, similar to `requirements.txt` in python: `xargs --no-run-if-empty --arg-file=mypackages.txt sudo apt-get install -y`
- `apt-get`
    - Hide the output of `apt-get install` completely: `sudo apt-get -yq install <package_name> &> /dev/null` (Not recommended) &rarr; `sudo apt-get -yq install <package_name> &> /var/log/apt-install.log` (Recommended)
        - `-qq` = `-y` (You should never use `-qq` without a no-action modifier such as `-d`, `--print-uris` or `-s` as APT may decided to do something you did not expect.)
    - Make the output of `apt-get install` less noisy:
        - `sudo DEBIAN_FRONTEND=noninteractive && apt-get -yq install [packagename]`
        - `sudo DEBIAN_FRONTEND=noninteractive apt-get -yq install [packagename]`
- `tr`: Translate characters, transformations including uppercase to lowercase, squeezing repeating characters, deleting specific characters, basic find, and replace/substitution
        - Flags/Options
        - Examples
            - `tr '
' ' '`: Replace newline characters with spaces
- `grep`
- `sed`
- `awk`
- `exit [n]` v.s `return [n]`
    - exit exits the calling shell or shell script
    - return exits a function
- `ffmpeg`
	- a free and open-source command-line tool consisting of a suite of libraries and programs for processing video, audio, and other multimedia files and streams.