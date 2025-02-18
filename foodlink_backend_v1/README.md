# Installation guide and Setup for Backend

## Pre-requisite 
- Install python: https://www.python.org/downloads/
  (command to check if you have python already installed: `which python3`)
- Install pip: https://pip.pypa.io/en/stable/installation/
  
  Usually, pip is automatically installed if you are:
  
  - working in a virtual environment
  - using Python downloaded from python.org
  - using Python that has not been modified by a redistributor to remove ensurepip

## Setup up project locally:
- clone the repository 
- set up a virtual environment, so that we keep abstraction between the application and our local machine (whatever we install will not affect our local machine)
  ```bash
  # Virtual Environment 
  python3 -m venv venv

  # Platform-Specific Commands for activation
    ## Window
    <venv>\Scripts\Activate.ps1 (powershell)
    ## mac/linux
    source venv/bin/activate
  
  python3 -m pip install -r requirements.txt
  ```
- 
- 
  
