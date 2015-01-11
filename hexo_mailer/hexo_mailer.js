


var fs = require('fs');
var ejs = require('ejs');
var feedSub = require('feedsub');
var mandrill = require('mandrill-api/mandrill');
var mandrill_client = new mandrill.Mandrill('LOJ5Fb0Y1JuogEph837y9g');
var csvFile = fs.readFileSync("friend_list.csv","utf8");
var emailTemplate = fs.readFileSync("email_template.ejs","utf8");
var blogContent = new FeedSub('http://newms34.github.io/atom.xml', {
		emitOnStart: true
});
var latestPosts = [];
 
blogContent.read(function(err,blogPosts) {
	blogPosts.forEach(function(post) {
		var link = post["link"];
		var postObj = {
			href: link["href"],
			title: post["title"]
		}
	var postDate = new Date();
	var timeString = (post.published.substr(0,10));
	var yearP = timeString.substr (0,4);
	var monP = timeString.substr(5,2);
	var dayP = timeString.substr(8,2);
	postDate.setUTCFullYear(yearP,monP,dayP);
	postDate = parseInt(postDate.getTime());

	nowTime = new Date();//get today's date for comparison
	nowTime = parseInt(nowTime.getTime());
	var timeDif = nowTime - postDate;
 	if (timeDif<604800000) {
 		console.log('Recent post added!');
 		latestPosts.push(post);
 	}
 	else {
 		console.log('No recent posts!');
 	}
	});
});

function csvParse(file) {
	var arrObj = [];
	var lines = file.split("\n");
	var keys = lines.shift().split(",");
	lines.forEach(function(person) {
		var contact = person.split(",");
		var contactObj = {};
		for (var i = 0; i < contact.length; i++) {
			contactObj[keys[i]] = contact[i];
		}	
		arrObj.push(contactObj);
	})
	return arrObj;
}

friendList = csvParse(csvFile);

friendList.forEach(function(row) {
	firstName = row.firstName;
	lastName = row.lastName;
	numMonthsSinceContact = row.monthsSinceContact;
	email = row.emailAddress;
	copyTemplate = emailTemplate;
	var customizedTemplate = ejs.render(copyTemplate, 
		{	firstName: firstName,
			monthsSinceContact: numMonthsSinceContact,
			latestPosts: latestPosts
		});
	sendEmail(firstName + " " + lastName, email, "Michael Bae", "michaelbbae@gmail.com", "My Newsletter", customizedTemplate);
});


function sendEmail(to_name, to_email, from_name, from_email, subject, message_html){
  var message = {
      "html": message_html,
      "subject": subject,
      "from_email": from_email,
      "from_name": from_name,
      "to": [{
              "email": to_email,
              "name": to_name
          }],
      "important": false,
      "track_opens": true,    
      "auto_html": false,
      "preserve_recipients": true,
      "merge": false,
      "tags": [
          "Fullstack_Hexomailer_Workshop"
      ]    
  };
  var async = false;
  var ip_pool = "Main Pool";
  mandrill_client.messages.send({"message": message, "async": async, "ip_pool": ip_pool}, function(result) {
      // console.log(message);
      // console.log(result);   
  }, function(e) {
      // Mandrill returns the error as an object with name and message keys
      console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
      // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
  });
};