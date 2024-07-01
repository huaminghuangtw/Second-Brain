---
dg-publish: true
---
- [Mostly undocumented](https://github.com/RPi-Distro/raspi-config/blob/master/raspi-config), non-interactive mode (`nonint`) of `raspi-config` &rarr; The non-interactive mode is basically split into two modes: **get** (for checking current settings) and **do** (for writing new settings)
- https://raspberrypi-guide.github.io
- RPi is a Single-Board Computer (SBC)
- **Raspberry Pi Pico** (for embedded projects and low-level programming) v.s **Raspberry Pi Zero[ W]** (for general-purpose computing tasks)
- [SD Card Formatter](https://www.sdcard.org/downloads/formatter/) keeps the SD card operating at peak performance and reduce the potential chance of corrupting files
- Tools for customizing the Raspberry Pi OS image file (RasPiOS IMG customization)
	- [CustomPiOS: A Raspberry Pi and other ARM devices distribution builder](https://github.com/guysoft/CustomPiOS)
	- [pi-gen: Tool used to create the official Raspberry Pi OS images](https://github.com/RPi-Distro/pi-gen): Primarily generates images with a desired set of contents. You still need to burn the IMG to an SSD/SD, and do any host-specific (hostname, IP address, etc) configuration on that SSD/SD, or when the system is up and running.
	- [sdm: Raspberry Pi SD Card Image Manager](https://github.com/gitbls/sdm): Operates on a previously generated IMG (either from RasPiOS, or your own pi-gen generated image). It's more like an "IMG editor", configuring stuff (apps, settings, etc) the way you want them. Then, once you have the IMG configured the way you want, you can burn a bunch of SSD/SD from that IMG and apply host-specific customizations such as hostname, static IP address, install specific packages for a host, etc.
		- [Plugins](https://github.com/gitbls/sdm/blob/master/Docs/Plugins.md)
		- All plugins specified will be called for Phase 0
		- (For development of new plugins) Do the most minimally possible sdm to test out a new plugin, or some other setting that depends only on the base system
			- Test a new plugin doing as little as possible so that plugin test run is quick
			- sudo sdm --customize --nouser --poptions noupdate,noupgrade,noautoremove --plugin myplugin 2023-02-21-raspios-bullseye-arm64.img
	- [rpi-imager](https://github.com/raspberrypi/rpi-imager): As with sdm, operates on a previously generated IMG and burns it to an SD card. the pi-imager GUI enables a subset of configuration settings (wireless config, ssh keys, users, etc), so in that way it is like sdm with less functionality, but a GUI so easier to use for GUI-oriented users.
		- /boot/firstrun.sh
		- /boot/cmdline.txt
		- /boot/config.txt
- OS images burning tools
  - [Raspberry Pi Imager](https://www.raspberrypi.com/software/)
  - [Balena Etcher](https://etcher.balena.io/).
- Network Management
	- NetworkManager (nm)
		- Default on Bookworm (Debian 12)
        - [Official documentation](https://networkmanager.dev/docs/api/latest/)
        - Key feature: easily switch WiFi connections
        - Two files
          - `nmconf` (\*.conf): nm configuration files
            - Synopsis
              - `/etc/NetworkManager/NetworkManager.conf`
              - `/etc/NetworkManager/conf.d/name.conf`
              - `/run/NetworkManager/conf.d/name.conf`
              - `/usr/lib/NetworkManager/conf.d/name.conf`
              - `/var/lib/NetworkManager/NetworkManager-intern.conf`
          - `nmconn` (\*nmconnection): nm connection keyfiles
            - Each WiFi network requires a .nmconnection file
            - The files are in a .ini-style format and located in
              - `/etc/NetworkManager/system-connections/`
              - `/usr/lib/NetworkManager/system-connections/`
              - `/run/NetworkManager/system-connections/`
	- dhcpcd
		- Default on Bullseye (Debian 11) and earlier
		- `/etc/wpa_supplicant/wpa_supplicant.conf`
- RasPiOS Buster, Bullseye, and Bookworm are different versions of the Raspberry Pi operating system—Buster is the previous stable release, Bullseye is the current stable release, and Bookworm is the upcoming release.
- Useful commands
  - lslogins -u
- Rules for hostnames
  - Each element of the hostname must be from 1 to 63 characters long and the entire hostname, including the dots, can be at most 253 characters long.
  - Valid characters for hostnames are ASCII letters, including upper or lower cases (A to Z or a to z), digits (0 to 9), the dot symbol (.), and the hyphen symbol (-).
  - A hostname may not begin or end with a hyphen.
  - No other symbols, punctuation characters, or blank spaces are permitted.
  - Use a hyphen (-) instead of the underscore (\_) in the hostname.
  - Example error messages
    - `unable to resolve host (hostname) : Name or service not known`
    - `sudo: unable to resolve host mypiuser_1: Temporary failure in name resolution`
- Configure SSH Hosts
  - `~/.ssh/config`
	```
	Host myHost1
		HostName myHost1 (or <ip-address>)
		User root
	Host myHost2
		HostName myHost2 (or <ip-address>)
		User root
	Host myHost3
		HostName myHost3 (or <ip-address>)
		User root
	```
- `/etc/passwd`
- `ifconfig` (in Unix/Linux/Mac) [v.s. `ipconfig` (in Windows)] displays all the TCP/IP network configurations of the computer