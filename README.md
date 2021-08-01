## INFO

This is a bot that can help book slots at "Harz Adrenaline" on a specific date. 
The script can be set to run periodically on AWS lambda. It can send text messages using Twilio if free slots are available.

### Configuration

* AWS lambda - Setup a AWS lambda with node and schedule a timer trigger to periodically run the script.
* Twilio - Set the environment variables used in the script and configure twilio credentials and the recipient phone number.