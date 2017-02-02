#!/bin/bash
# Build script for modern-html5-boilerplate with marlin-vagrant
txtbold=$(tput bold)
boldyellow=${txtbold}$(tput setaf 3)
boldgreen=${txtbold}$(tput setaf 2)
boldwhite=${txtbold}$(tput setaf 7)
yellow=$(tput setaf 3)
green=$(tput setaf 2)
white=$(tput setaf 7)
txtreset=$(tput sgr0)

echo "${boldyellow}Project name in lowercase:${txtreset} "
read -e PROJECTNAME
PROJECTPATH="${HOME}/Projects/${PROJECTNAME}"
echo "${yellow}Setting project path as $PROJECTPATH${txtreset}"
cd "${HOME}/Projects"
git clone https://github.com/ronilaukkarinen/modern-html5-boilerplate ${PROJECTNAME}
echo "${yellow}Renaming project...${txtreset}"
sed -e "s/\yourprojectname/$PROJECTNAME/" -e "s/\modern-html5-boilerplate/$PROJECTNAME/" $PROJECTPATH/gulpfile.js > $PROJECTPATH/gulpfile2.js && rm $PROJECTPATH/gulpfile.js && mv $PROJECTPATH/gulpfile2.js $PROJECTPATH/gulpfile.js
sed -e "s/\yourprojectname/$PROJECTNAME/" -e "s/\modern-html5-boilerplate/$PROJECTNAME/" $PROJECTPATH/package.json > $PROJECTPATH/package2.json && rm $PROJECTPATH/package.json && mv $PROJECTPATH/package2.json $PROJECTPATH/package.json
echo "${yellow}Cleaning up...${txtreset}"
cd "${PROJECTPATH}"
rm README.md
rm LICENSE.md
rm -rf .git
echo "server {
    listen 80;
    #listen [::]:80 default ipv6only=on;

    root /var/www/$PROJECTNAME;
    index index.html index.htm index.php;

    server_name $PROJECTNAME.dev www.$PROJECTNAME.dev;
    include hhvm.conf;
    include global/wordpress.conf;
}" > "$HOME/Projects/marlin-vagrant/vhosts/$PROJECTNAME.dev"

echo "${boldgreen}Added vhost, $PROJECTNAME.dev added to vagrant sites-enabled.${txtreset}"
echo "${yellow}Reprovisioning vagrant...${txtreset}"
cd ~/Projects/marlin-vagrant
vagrant provision
echo "${boldgreen}VM provisioned, local environment up and running.${txtreset}"
echo "${yellow}Updating hosts file...${txtreset}"
sudo -- sh -c "echo 10.1.2.4 ${PROJECTNAME}.dev >> /etc/hosts"
cd "${PROJECTPATH}"
echo "${yellow}Updating npm packages...${txtreset}"
npm-check-updates -u
echo "${yellow}Installing npm packages...${txtreset}"
echo "${boldgreen}All done!${txtreset}"
echo "${yellow}Opening project in atom...${txtreset}"
atom $PROJECTPATH
echo "${yellow}Starting gulp...${txtreset}"
gulp watch
