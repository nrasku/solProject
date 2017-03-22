$(document).ready(function() {
	$(".btn").click(function() {
			$(this).siblings('h4').hide();
			var selector = $(this).parent().parent().attr("id");
			if(!$(this).hasClass('hideBtn')) { /*If button is hideBtn we don't want it to send ajax call...*/
				$(this).hide();
			}else { return; }
			$(this).next().show();
			selector = selector.slice(0, selector.length -1);
			try {
				$.ajax({
					type: "GET",
					url: "HourList201403.csv",
					dataType: "text",
					success: function(data) { 
								readData(data, selector); 
							 }
				});
			}catch(err) {
				$("#errmsg").text("We were unable to read the Work Hour Data...");
				console.log(err.message);
			}
	});
	
	$('.hideBtn').click( function() {
		if ($(this).text() == "Hide Table") { $(this).text("Show table") }
		else { $(this).text("Hide Table"); }
		
		
		$(this).next().toggle("fast");
		
	});
	
});

function readData(allLines, selector) {
	var allDataLines = allLines.split(/\r\n|\n/);
	var fieldNames = allDataLines[0].split(',');
	var lines = [];

	for (var i = 1; i < allDataLines.length; i++) {
		var person = allDataLines[i].split(',');
		try {
			person[3] = addLeadingZero(person[3]);
			person[4] = addLeadingZero(person[4]);
		}catch (err) {
			console.log(err.message);
		}
		if( person.length == fieldNames.length ) {
			var headWithValue = [];
			var value = [];
			for ( var h = 0; h < fieldNames.length; h++) {
				value.push(person[h]);
			}
			lines.push(value); 
			
		}
	}
	var id;
	var data = [];
	if(selector == 'janet') { id = '1' }
	if(selector == 'scott') { id = '2' }
	if(selector == 'larry') { id = '3' }
	for (var i = 0; i < lines.length; i++) {
		if (lines[i][1] == id) {
			data.push(lines[i]);
		}
	}
	var total = calc(data);
	var monthly = total[0];
	var daily = total[1];
	addTable(monthly, daily, selector, data);
}

function calc(lines) {
		var monthlyWage = 0;
		var dailyWages = [];
		for(var p = 0; p < lines.length; p++) {
			var data = lines[p];
			var diff = difference(data[3], data[4]);
			var evening = eveningCompensation(data[3], data[4], diff);
			var wage = calcWage(diff);
			var eveningComp = evening * 1.15;
			var overComp = overtime(diff);
			var dailyWage = wage + eveningComp + overComp;
			dailyWages.push(dailyWage.toFixed(2));
			monthlyWage += dailyWage;
		}
		
		return [monthlyWage, dailyWages];
		
}	

function addLeadingZero(time) {
	var splitTime = time.split(':');
	if(splitTime[0].length == 1) {
		splitTime[0] = '0' + splitTime[0];
		var correctTime = splitTime[0] + ':' + splitTime[1];
		return correctTime;
	}else {
		return time;
	}
}

function difference(start, end) {
	start = start.split(':');
	end = end.split(':');
	
	var startDate = new Date(0, 0, 0, start[0], start[1], 0);
	var endDate = new Date(0, 0, 0, end[0], end[1], 0);
	var diff = endDate.getTime() - startDate.getTime();
	var diffHours = diff / 1000 / 60 / 60;

	if(diffHours < 0) {
	    diffHours += 24;
	}
	return diffHours;

}

function calcWage(hours) {
	var hourlyWage = 3.75;
	
	var wage = hours * 3.75;
	
	return wage;
	
	
}

function eveningCompensation(start, end, diff) {
	start = start.split(':');
	end = end.split(':');
	var eveningH = 0;
	if(start[0] <= end[0]) {
		var startDate = new Date(0, 0, 0, start[0], start[1], 0);
		var endDate = new Date(0, 0, 0, end[0], end[1], 0);
	}else {
		var startDate = new Date(0, 0, 0, start[0], start[1], 0);
		var endDate = new Date(0, 0, 1, end[0], end[1], 0);
	}
	var diff = endDate.getTime() - startDate.getTime();
	var diffHours = diff / 1000 / 60 / 60;

	if(diffHours < 0) {
	    diffHours += 24;
	}
	var end = moment(endDate);
		for (var date = moment(startDate); date.diff(end) < 0; date.add(10, 'minutes')) {
			var mins = date.get('minutes');
			mins = (mins < 10 ? '0' :  '') + mins;
			var time = date.get('hours') + '' + mins;
			if (time >= 1800 && time < 2359) {
				eveningH++;
			}else if(time >= 0 && time < 559 )  {
				eveningH++;
			}else { continue; }
			
		}
	
	eveningH /= 6;
	eveningH = eveningH.toFixed(2);
	
	return eveningH;
}

function overtime(diff) {
	if (diff > 8) {
		var over = diff - 8;
	}else {
		return 0;
	}
	var minutes = over * 60;
	var hours = Math.floor(over);
	minutes %= 60;
	var time = hours + '' + minutes;
	var overpay = 0;
	var start = new Date(0, 0, 0, 0, 0, 0);
	var end = new Date(0, 0, 0, hours, minutes, 0);
	for (var date = moment(start); date.diff(end) < 0; date.add(1, 'minutes')) {
		var mins = date.get('minutes');
		mins = (mins < 10 ? '0' : '') + mins;
		time = date.get('hours') + '' + mins;
		if (time < 200) {
		    overpay += (3.75 + (3.75 * 0.25));
		}else if (time > 200 && time < 400) {
			overpay += (3.75 + (3.75 * 0.50));
		}else {
			overpay += (3.75 + (3.75 * 1));
		}
	}
	overpay /= 60;
	return Math.ceil(overpay * 100) / 100;
	
	
}

function addTable(total, total2, selector, data) {
	var dailyWages = total2;
	var selector1;
	var selector2;
	console.log(data);
	if( selector == 'janet' ) { selector1 = "#workHourRecordsJanet > tbody:last-child";
								selector2 = "#janetJ";	}
	if( selector == 'scott' ) { selector1 = "#workHourRecordsScott > tbody:last-child"; 
								selector2 = "#scottS";	}
	if( selector == 'larry' ) { selector1 = "#workHourRecordsLarry > tbody:last-child"; 
								selector2 = "#larryL";	}
	for(var i = 0; i < data.length; i++) {
		$(selector1).append("<tr><td>" 
			   + data[i][0] + "</td><td>" 
			   + data[i][1] + "</td><td>" 
			   + data[i][2] + "</td><td>" 
			   + data[i][3] + "</td><td>" 
			   + data[i][4] + "</td><td class='total'>"
			   + dailyWages[i] + "</td></tr>");
	}	
	var name = selector.toLowerCase().replace(/\b[a-z]/g, function(letter) {
		return letter.toUpperCase();
	});
	$(selector2 + ' .hideBtn').after('   ' + name + "\'s Total Monthly Wage - " + Math.ceil(total * 100) / 100);

}













