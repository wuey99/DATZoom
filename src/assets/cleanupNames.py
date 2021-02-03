#-----------------------------------------------------------------------------
import xml.etree.ElementTree as ET
import sys
import subprocess
import os
import glob
import re
import shutil
from distutils.dir_util import copy_tree
from zipfile import ZipFile

#-----------------------------------------------------------------------------
def get_all_file_paths(directory):

    # initializing empty file paths list
    file_paths = []

    # crawling through directory and subdirectories
    for root, directories, files in os.walk(directory):
        for filename in files:
            # join the two strings in order to form the full filepath.
            filepath = os.path.join(root, filename)
            file_paths.append(filepath)

    # returning all file paths
    return file_paths

#-----------------------------------------------------------------------------
file_paths = get_all_file_paths(os.getcwd())

for path in file_paths:
	print ": ", path

	if "Copy of " in path:
		newPath = path.replace ("Copy of ", "")

		print ": ", newPath

		shutil.move (path, newPath)
