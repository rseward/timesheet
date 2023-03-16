#!/usr/bin/env python

from distutils.core import setup
#from setuptools import setup, find_packages

setup(name='bluestone-timesheet',
      version='1.0',
      description='Bluestone Timesheet Module',
      author='Robert Seward',
      author_email='rseward@bluestone-consulting.com',
      url='http://www.bluestone-consulting.com/',
      # python package dirs will require at a minimum an empty __init__.py file
      #   in them.

      packages=['bluestone', 'bluestone.timesheet'],
      scripts=[],      

      package_dir={'bluestone':'src/bluestone'}
    )
