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

while true; do
echo "${boldyellow}Which local environment you are using?${txtreset}

Type:

1 for marlin-vagrant: https://github.com/digitoimistodude/marlin-vagrant
2 for native OS X: https://github.com/digitoimistodude/osx-lemp-setup
"
read choice

echo
case $choice in
     1)
      choice="marlin-vagrant"
      localip="10.1.2.4"
      break
      # Choose $choice
     ;;
     2)
      choice="osxlemp"
      localip="127.0.0.1"
      break
      # Choose $choice
     ;;
     *)
     echo "${red}Please type, 1 or 2 only.${txtreset}
     "
     ;;
esac
done

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
rm build.sh
rm -rf .git

if [ $choice == "marlin-vagrant" ]
then

echo "server {
    listen 80;
    root /var/www/$PROJECTNAME/dist;
    index index.html index.htm index.php;
    server_name $PROJECTNAME.test www.$PROJECTNAME.test;
    include php7.conf;
    include global/wordpress.conf;
}" > "$HOME/Projects/marlin-vagrant/vhosts/$PROJECTNAME.test"

echo "${boldgreen}Added vhost, $PROJECTNAME.test added to vagrant sites-enabled.${txtreset}"
echo "${yellow}Reprovisioning vagrant...${txtreset}"
cd ~/Projects/marlin-vagrant
vagrant provision
echo "${boldgreen}VM provisioned, local environment up and running.${txtreset}"
echo "${yellow}Updating hosts file...${txtreset}"
sudo -- sh -c "echo 10.1.2.4 ${PROJECTNAME}.test >> /etc/hosts"

fi
if [ $choice == "osxlemp" ] ;
then

sudo echo "server {
    listen 80;
    root /var/www/$PROJECTNAME/dist;
    index index.html index.htm index.php;
    server_name $PROJECTNAME.test www.$PROJECTNAME.test;
    include php7.conf;
    include global/wordpress.conf;
}" > "/etc/nginx/sites-available/$PROJECTNAME.test"
sudo ln -s /etc/nginx/sites-available/$PROJECTNAME.test /etc/nginx/sites-enabled/$PROJECTNAME.test
echo "${boldgreen}Added vhost, $PROJECTNAME.test linked to sites-enabled.${txtreset}"
echo "${yellow}Restarting nginx...${txtreset}"
sudo brew services stop nginx
sudo brew services start nginx
echo "${boldgreen}nginx restarted, local environment up and running.${txtreset}"
echo "${yellow}Updating hosts file...${txtreset}"
sudo -- sh -c "echo 127.0.0.1 ${PROJECTNAME}.test >> /etc/hosts"

fi

cd "${PROJECTPATH}"
echo "${yellow}Installing npm packages...${txtreset}"
npm install
echo "${boldgreen}All done!${txtreset}"
