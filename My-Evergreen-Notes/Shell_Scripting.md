- Tools
  - https://www.shellcheck.net/
  - https://github.com/bats-core/bats-core
- Logging & Redirection
  - In Unix and Unix-like computer operating systems, every process starts with 3 standard file descriptors (FD): 0 – Standard input (`stdin`); 1 – standard output (`stdout`); 2 – standard error (`stderr`) &rarr; [Example](https://stackoverflow.com/a/18462920/10351382)
  - Logging Levels (in order of fatality): (1) FATAL (2) ERROR (3) WARN (4) INFO (5) DEBUG (6) TRACE &rarr; `logger [-p or --priority] [priority]` &rarr; The priority may be specified numerically or as a _[facility.level](https://man7.org/linux/man-pages/man1/logger.1.html#FACILITIES_AND_LEVELS)_ pair
  - Best Practices
    - For immediate feedback &rarr; write to the console
      - `/dev/console`
    - For long-term record &rarr; write to the system log file
  - Commands
    - In the case of most Linux systems, `logger [options] "messages"` writes messages to the system log file `syslog` located at `/var/log` &rarr; `sudo tail -f /var/log/syslog`
    - tee [OPTIONS] (`-a`/`--append`, `-i`/`--ignore-interrupts`) [FILE]
      - for redirecting output of individual commands to a file (while still displaying it on the terminal)
    - script [OPTIONS] (`-q`/`--quiet`) [FILE]
      - for recording complete terminal sessions (will not display output on the terminal)
- 比較
  - Check for string emptiness &rarr; `-z "$string"` or `${#string} -eq 0`
  - Check for string non-emptiness &rarr; `-n "$string"`
  - `-n` is the same as `! -z`
- Both `[` and `test` commands are used interchangeably
- 比較

      - Check the existence of a **directory**: `if [ -d </path/to/a/directory> ]; then`
      - Check the existence of a **file**: `if [ -e </path/to/a/file> ]; then`

- `[ ... ]` and `[[ ... ]]`
- Check for the existence of input arguments

  ```
  [ $# -ne 1 ] && { echo "USAGE: $0 <var>"; exit 1; }
  [ -z "$1" ] && { echo "ERROR - Missing argument: <var>"; exit 1; }
  var=$1

  ```

- Default-value syntax for optional command-line input arguments

  > https://stackoverflow.com/questions/9332802/how-to-write-a-bash-script-that-takes-optional-input-arguments

  - The expansion of word is substituted, if parameter is unset or null (i.e., empty string)

    - In other words, if the colon is included, the operator tests for both parameter's existence and that its value is not null

    ```
    somecommand ${1:-foo}
    ```

  - The expansion of word is substituted, if parameter is unset

    - In other words, if the colon is omitted, the operator tests only for parameter's existence.

    ```
    somecommand ${1-foo}
    ```

- Parameter expansion

  - Example

    ```
    #!/bin/bash

    # Given input string

    input_string="firmware/1.7.17.zip"

    # Extract the version number using parameter expansion

    version=${input_string#*/}  # Remove everything before the first /
    version=${version%.zip}     # Remove the .zip extension

    # Print the extracted version number

    echo "Version: $version"

    ```

- It's a good practice to provide only the minimum necessary permissions to users and groups to ensure the security and integrity of the system
- Code snippet to...

  - Note:

  ```
  line1
  line2
  line3
  EOF
  ```

  needs to be left-aligned!

  - Append content to a file

  ```
  file_path="/usr/local/myfile.txt"

  cat <<EOF >> "${file_path}"
  line1
  line2
  line3
  EOF
  ```

  or

  ```
  content="..."
  file_path="/usr/local/myfile.txt"
  echo "${content}" >> "${file_path}"
  ```

  - Create a file with the given content

  ```
  file_path="/usr/local/myfile.txt"

  sudo tee "${file_path}" > /dev/null <<EOL
  line1
  line2
  line3
  EOL
  ```

  - Be aware of indentations (spaces or tabs)

- In a shell script, the `wait` command is used to wait for the background processes to finish before proceeding with the execution of subsequent commands. When a command or a series of commands are executed in the background (using the `&`), the wait command ensures that the script waits for all background processes to complete before moving on to the next set of instructions.

  ```
  #!/bin/bash

  # Start a background process
  some_command &

  # Another background process
  another_command &

  # Wait for all background processes to finish
  wait

  # Continue with the script
  echo "All background processes have completed."
  ```