import urllib.request
import tarfile
import os

url = "https://nodejs.org/dist/v20.15.0/node-v20.15.0-linux-x64.tar.gz"
tar_name = "node-v20.15.0-linux-x64.tar.gz"
dest_dir = "/home/mujtaba/Documents/MarkaziDarulIfta/node-env"

if os.path.exists(dest_dir):
    print("node-env already exists, skipping download.")
else:
    print("Downloading Node.js v20.15.0 from", url)
    try:
        urllib.request.urlretrieve(url, tar_name)
        print("Download complete. Extracting...")
        
        with tarfile.open(tar_name, "r:gz") as tar:
            tar.extractall(path="/home/mujtaba/Documents/MarkaziDarulIfta")
            
        extracted_name = "/home/mujtaba/Documents/MarkaziDarulIfta/node-v20.15.0-linux-x64"
        if os.path.exists(extracted_name):
            os.rename(extracted_name, dest_dir)
            print("Node.js extracted to:", dest_dir)
        else:
            print("Error: Extracted directory not found at", extracted_name)
            
    except Exception as e:
        print("Error during download/extraction:", e)
    finally:
        if os.path.exists(tar_name):
            os.remove(tar_name)
            print("Cleaned up downloaded tar file.")
