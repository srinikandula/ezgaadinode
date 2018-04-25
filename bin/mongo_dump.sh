#!/bin/bash
#
# This script will perform a mongo dump of the local database and uploads the dump in to s3://mybus-mongo-dump-uploads.
# The dump will be placed in a subdirectory named after the current date and time.
#
# Usage:  ./mongo_backup.sh
#

set -ex

# to retain all backups, set this value to a non-positive integer
mongo_backup_dir=~/mongo_dumps

if [ $# -ne 4 ]
  then
    echo "ERROR: Not enough params. Usage: mongo_backup.sh <S3_bucket_name> <dbname> <username> <password>"
    exit 1
fi

bucket=$1
database=$2
username=$3
password=$4

# base dir is the bin dir of the ube project
basedir="`dirname $0`"

mkdir -p $mongo_backup_dir
chmod 777 $mongo_backup_dir || true
pushd $mongo_backup_dir

output_dir=`date +%Y%m%d-%H%M`
mkdir -p $mongo_backup_dir/$output_dir
mongodump --host localhost --db=$database --port 27017 --out $mongo_backup_dir/$output_dir --username $username --password $password
zip -9r $output_dir.zip $output_dir


printf "Backup was saved to file %s in $PWD\n\n" $output_dir.zip

popd

s3cmd put $mongo_backup_dir/$output_dir.zip s3://$bucket/

rm -rf $mongo_backup_dir

exit 0