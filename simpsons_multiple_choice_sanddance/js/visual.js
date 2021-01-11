// turn on/off console logging
var DEBUG_STATE = true;

// subject-level variables as globals
var assignment_id, worker_id, hit_id, submit_to;
var ts_consent_start, ts_explain_start, ts_is_same_dataset_start;
var ts_degree_stepthru_1, ts_degree_stepthru_2, ts_degree_stepthru_3;
var ts_work_degree_stepthru_1, ts_work_degree_stepthru_2, ts_work_degree_stepthru_3;
var ts_two_gifs;
var ts_explain_end;

//treatment variables
var condition; // 1: show counts; 2: now show counts
var condition_set;

// dependent variables
var is_same_dataset_choice;
var explanation_text;
var question_choice_order = {};
var selected_answer_position;
var written_explanation;
var future_choice, future_text;

var is_loaded = {
  "degree-two-colors" : false,
  "work-degree-two-colors": false
};


function main() {

    validate_forms();
    set_up_choices();
    // $('#explain').hide();
    hide_all();



    // create fake assignment id, hit id, and worker id if none provided
    if ($.url().attr('query') == "") {
      logger('creating fake assignment');
      // generate fake assignment_id, worker_id, and hit_id
      var params = create_test_assignment();
      var query_str = window.location.pathname + '?' + $.param(params);
      window.history.pushState("", "", query_str);
    }

    // parse url parameters
    assignment_id = $.url().param('assignmentId');
    worker_id = $.url().param('workerId');
    hit_id = $.url().param('hitId');
    submit_to = $.url().param('turkSubmitTo');

    // grab viz condition from url param
    condition = $.url().param('condition');

    // grab set of viz conditions from url param
    condition_set = $.url().param('condition_set');


    if (assignment_id == 'ASSIGNMENT_ID_NOT_AVAILABLE') {
      $('#preview').show();
      return; // quit?
    } else {
      //assign treatment variables
      if (typeof(condition) == "undefined") {
        logger('randomizing show/not show counts condition');

        // use 1 and 2 as default conditions
        if (typeof(condition_set) === "undefined") {
          // NOTIZ: three conditions
          // static
          // combined
          // stepthru
          // condition_set = 'static,combined,stepthru,stepthru_textonly';
          condition_set = 'static,stepthru';
        }
        condition_set = condition_set.split(',');
        ndx = getRandomInt(0, condition_set.length-1);
        condition = condition_set[ndx];
      }
    }

    // ======== apply condition ========
    if (condition == "static") {
      $('#p_response').text("Your job is to explore how work settings and degrees relate to salaries in this survey. Therefore you created two charts, shown below, to inspect data from all 100 respondents. The points in each chart show average salaries and the bars represent margins of error (95% confidence intervals) around the averages.");
    } else if (condition == "combined") {
      $('#h2_combined').text("Inspecting survey data");
      $('#p_combined').text("You analyzed the responses from all 100 participants in two ways. First, you looked at how work settings alone relate to salaries for all 100 participants, shown in the movie on the left. Then, you looked at how work settings AND degree relate to salaries for all 100 participants, shown in the movie on the right. The points in Step 3 of each movie show average salaries and the bars represent margins of error (95% confidence intervals) around the averages.");

      $('#h2_response').text("Reflecting on your findings");
      $('#p_response').text("These graphs are from the final step of your analysis, on how work settings and degrees relate to salaries. The points here show average salaries and the bars represent margins of error (95% confidence intervals) around the averages.")

      // $('#p_response').text("");
    } else { // condition == "stepthru"
      $('#h2_combined').text("Putting it together");
      //$('#p_combined').text("These animations combine the steps you just saw.");
      $('#p_combined').text("In summary, you analyzed the responses from all 100 participants in two ways. First, you looked at how work settings alone relate to salaries for all 100 participants, shown in the movie on the left. Then, you looked at how work settings AND degree relate to salaries for all 100 participants, shown in the movie on the right. The points in Step 3 of each movie show average salaries and the bars represent margins of error (95% confidence intervals) around the averages.");

      $('#h2_response').text("Reflecting on your findings");
      $('#p_response').text("These graphs are from the final step of your analysis, on how work settings and degrees relate to salaries. The points here show average salaries and the bars represent margins of error (95% confidence intervals) around the averages.")

    }



    logger("condition: " + condition + " out of " + condition_set);

    log_start_of_experiment();

    $('#consent').show();
    ts_consent_start = getDateTime();
    logger("ts_consent_start: " + ts_consent_start);

    // ==== promise =====
    $('#two_gifs').hide();
    $('#two_gifs_form').hide();
    // $('#degree-two-colors, #work-degree-two-colors').load(function() {
    //   $('#waiting-for-combined').slideUp();
    // });
    function load_gif(url) {
      return new Promise(resolve => {
        const image = new Image();
        image.addEventListener('load', () => {
          resolve(image);
        });
        image.src = url;
      });
    }

    Promise
    .all([load_gif("https://jhofman.github.io/datamations/simpsons_multiple_choice_sanddance/img/Degree_two_colors.gif"),
    load_gif("https://jhofman.github.io/datamations/simpsons_multiple_choice_sanddance/img/Work_Degree_two_colors.gif")])
    .then(function(res1, res2){
      console.log("two gifs load sucessfully");
      $('#waiting-for-combined').slideUp();
      $('#two_gifs').show();
      $('#two_gifs_form').show();
    });



    // ===== END promise =====
}

// https://stackoverflow.com/a/34726863
function is_img_loaded(img) {
  return $(img).prop('complete') && $(img).prop('naturalHeight') !== 0;
}

// get random integer in range (inclusive)
// stolen from https://stackoverflow.com/a/1527820
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// hides all divs
function hide_all() {
    $('#preview').hide();
    $('#consent').hide();

    // neue pages
    $('#survey_intro').hide();
    $('#step_thrus').hide();
    $('#combined').hide();
    $('#response').hide();
    $('#explain').hide();
    $('#future').hide();
    $('#bye').hide();

    // gif steps
    $('#degree_stepthru_2').hide();
    $('#degree_stepthru_3').hide();
    $('#work_degree_stepthru_1').hide();
    $('#work_degree_stepthru_2').hide();
    $('#work_degree_stepthru_3').hide();


}

function log_start_of_experiment() {
	$.ajax({
		url: "https://mturk-function-app-node.azurewebsites.net/api/mturk-insert-response",
		//contentType: "application/json",
		type: "POST",
		//datatype: "json",
		data: JSON.stringify({
      study_id : "simpsons_multiple_choice_sanddance",
			hitId: hit_id,
			assignmentId: assignment_id,
			workerId: worker_id,
      condition: condition,
      version: "extra_logging",
			ts_start: getDateTime()
		}),
		success: function (data) {
			console.log(data);
		},
		error: function (request, error) {
			console.log("Error. Request: " + JSON.stringify(request))
			console.log(error);
		}
	});

}

function log_timestamp_to_azure(ts_name) {
  var params = {
    study_id : "simpsons_multiple_choice_sanddance",
    hitId: hit_id,
    assignmentId: assignment_id,
    workerId: worker_id,
    condition: condition,
  };

  params[ts_name] = getDateTime();

	$.ajax({
		url: "https://mturk-function-app-node.azurewebsites.net/api/mturk-insert-response",
		//contentType: "application/json",
		type: "POST",
		//datatype: "json",
		data: JSON.stringify(params),
		success: function (data) {
			console.log(data);
		},
		error: function (request, error) {
			console.log("Error. Request: " + JSON.stringify(request))
			console.log(error);
		}
	});

}

function validate_forms() {
    // set error message placement
    if (jQuery.validator) {
      jQuery.validator.setDefaults({
        errorPlacement: function(error, element) {
          if (element.next().prop('tagName') == 'SELECT'){
            error.insertAfter(element.next());
          } else if (element.attr('type') === 'radio'){
            // error.appendTo(element.parent());
            	error.insertBefore(element);
          } else {
            error.insertBefore(element);
          }
        }
      });
    }
    // https://stackoverflow.com/questions/19233901/jquery-validator-minimum-required-words
    function getWordCount(wordString) {
      var words = wordString.split(" ");
      words = words.filter(function(words) {
        return words.length > 0
      }).length;
      return words;
    }

    //add the custom validation method
    jQuery.validator.addMethod("wordCount",
    function(value, element, params) {
      var count = getWordCount(value);
      if(count >= params[0]) {
        return true;
      }
    },
    jQuery.validator.format("Please enter more than {0} words.")
  );



    $('#consent_form').validate({
      rules: {
        consent_checkbox: {
          required: true
        }
      }
    });

    // ======= NEU =======
    $('#is_same_dataset_form').validate({
      rules: {
        optradio1: {
          required: true
        }
      }
    });

    $('#explain_form').validate({
      rules: {
        explain_opt: {
          required: true
        }
      }
    });

    $('#future_form').validate({
      rules: {
        future_opt: {
          required: true
        },
        future: {
          required: true ,
          wordCount: ['5']
        }
      }
    });
}

function submit_consent() {
  $('#consent').slideUp(function() {
    $('#survey_intro').show();
    ts_is_same_dataset_start = getDateTime();
    logger("ts_is_same_dataset_start: " + ts_is_same_dataset_start );
  });
  log_timestamp_to_azure('ts_started_survey_intro');
}

function submit_survey_intro() {
  $('#survey_intro_form').slideUp(function(){

    // decide what to show based on condition
    if (condition == "static") {
      $('#response').show();
    } else if (condition == "combined") {
      show_two_gifs();
    } else if (condition == "stepthru") { // condition == "stepthru"
      $('#step_thrus').show();
      // the different texts
      $(".stepthru_text_only").remove();
    } else { // condition == "stepthru_text_only"
      $('#step_thrus').show();
      // the different texts
      $(".stepthru").remove();
    }
  });
}


function submit_is_same_dataset(){
  $('#is_same_dataset_wrapper').slideUp(function(){
    ts_explain_start = getDateTime();
    logger("ts_explain_start: " + ts_explain_start);
    $("#explain").show(function() {
      $('html,body').animate({scrollTop: $('#explain').offset().top}, "slow")
    });
    log_timestamp_to_azure('ts_started_explain_page');
  });
}


// for gif steps
function submit_degree_stepthru_1(){
  var next = '#degree_stepthru_2';
  ts_degree_stepthru_1 = getDateTime();
  $('#degree_stepthru_1_btn').slideUp(function(){
      $(next).show(function() {
        $('html,body').animate({scrolltop: $(next).offset().top}, "slow")
      });
  });

}

function submit_degree_stepthru_2() {
  var next = '#degree_stepthru_3';
  ts_degree_stepthru_2 = getDateTime();
  $('#degree_stepthru_2_btn').slideUp(function(){
      $(next).show(function() {
        $('html,body').animate({scrollTop: $(next).offset().top}, "slow")
      });
  });

}

function submit_degree_stepthru_3() {
  // $('#degree_stepthru_1').slideUp();
  // $('#degree_stepthru_2').slideUp();
  // $('#degree_stepthru_3').slideUp();
  var next = '#work_degree_stepthru_1';

  ts_degree_stepthru_3 = getDateTime();

  $('#degree_stepthru_3').fadeTo("slow",0.5);
  $('#degree_stepthru_2').fadeTo("slow",0.5);
  $('#degree_stepthru_1').fadeTo("slow",0.5);

  $('#degree_stepthru_3_btn').slideUp(function(){
    $(next).show(function() {
      $('html,body').animate({scrollTop: $(next).offset().top}, "slow")
    });
  });


  // $('#two_groupby').css('visibility', 'hidden'); // https://stackoverflow.com/questions/16316431/hide-div-but-keep-the-empty-space
}

function submit_work_degree_stepthru_1(){
  var next = '#work_degree_stepthru_2';
  ts_work_degree_stepthru_1 = getDateTime();
  $('#work_degree_stepthru_1_btn').slideUp(function(){
      $(next).show(function() {
	  $('html,body').animate({scrollTop: $(next).offset().top}, "slow")
      });
  });

  // $(window).scrollTop($(next).offset().top);
}

function submit_work_degree_stepthru_2(){
  var next = '#work_degree_stepthru_3';
  ts_work_degree_stepthru_2 = getDateTime();
  $('#work_degree_stepthru_2_btn').slideUp(function(){
      $(next).show(function() {
	  $('html,body').animate({scrollTop: $(next).offset().top}, "slow")
      });
  });

}

function submit_work_degree_stepthru_3(){
  // hide stuff and set scroll selected_answer_position
  // https://stackoverflow.com/questions/3432656/scroll-to-a-div-using-jquery
  // $('#degree_stepthru_1').slideUp();
  // $('#degree_stepthru_2').slideUp();
  // $('#degree_stepthru_3').slideUp();
  // $('#work_degree_stepthru_1').slideUp();
  // $('#work_degree_stepthru_2').slideUp();
  // $('#work_degree_stepthru_3').slideUp();
  ts_work_degree_stepthru_3 = getDateTime();
  if (condition == "stepthru_text_only") {
    $('#step_thrus').slideUp(function(){
      $("#response").show();
    });
  } else {
    $('#step_thrus').slideUp(function(){
      show_two_gifs();
    });
  }
}

function show_two_gifs() {
  $(window).scrollTop(0); // goes back to "Salary survey: who makes more money?"
  $("#combined").show();
  setTimeout(function() {
    $('#submit_two_gifs_btn').val("Click here to continue").removeAttr("disabled");
  }, 30000);
}

// function submit_four_summarizemean() {
//   $('#stepthru-1').slideUp(function(){
//   });
//
//   $('#stepthru-2').slideUp(function(){
//   });
// }

function submit_two_gifs() {
  ts_two_gifs = getDateTime();
  // mod: keep two gifs up when "is same dataset" shows();
  $('#submit_two_gifs_btn').slideUp(function(){
    $('#response').show();
    $('html,body').animate({scrollTop: $('#response').offset().top}, "slow");
  });
  // $('#combined').slideUp(function(){
  //   $("#response").show();
  // });
}

function submit_explanation(){
  $('#explain').slideUp(function(){
    $('#survey_intro').hide();
    $('#response').hide();
    $("#combined").hide();

    // set up the actions on the final submit page before showing it

    // first make sure it points back to mturk
    $('form#future_form').attr('action', submit_to + '/mturk/externalSubmit');

    // now collect all of the previous responses in one object
    // and add these responses as hidden inputs on the final form so mturk records them
    params = {
      assignmentId: assignment_id,
      workerId: worker_id,
      hitId: hit_id,
      condition: condition,
      // is_same_dataset_choice: is_same_dataset_choice,
      is_impossible_choice: is_same_dataset_choice,
      explanation_text: explanation_text,
      written_explanation: written_explanation,
      question_choice_order: question_choice_order,
      selected_answer_position: selected_answer_position,
      //future_choice: future_choice, // these will get included when the final form submits
      //future_text: future_text, // these will get included when the final form submits
      ts_consent_start: ts_consent_start,
      ts_degree_stepthru_1: ts_degree_stepthru_1,
      ts_degree_stepthru_2: ts_degree_stepthru_2,
      ts_degree_stepthru_3: ts_degree_stepthru_3,
      ts_work_degree_stepthru_1: ts_work_degree_stepthru_1,
      ts_work_degree_stepthru_2: ts_work_degree_stepthru_2,
      ts_work_degree_stepthru_3: ts_work_degree_stepthru_3,
      ts_two_gifs: ts_two_gifs,
      ts_is_same_dataset_start: ts_is_same_dataset_start,
      ts_explain_start: ts_explain_start,
      ts_explain_end: ts_explain_end,
      //ts_submitted_: ts_submitted, // if you change it to ts_submitted instead of ts_submitted_ this will break
      study_id : "simpsons_multiple_choice_sanddance"
    };
    logger(params);
    $.each(params, function (name, val) {
      $('form#future_form').append('<input type=hidden name="' + name + '" value="' + val + '" />');
    });

    $('form#future_form').submit(function (event) {

      event.preventDefault(); //this will prevent the default submit
      var _this = $(this); //store form so it can be accessed later

      // final time stamp
      ts_submitted = getDateTime();
      logger("ts_submitted: " + ts_submitted);

      // get values from the final form
      future_choice = $("input[name='future_opt']:checked").val();
      logger("future choice: " + future_choice);
      future_text = $("textarea#future").val();
      logger("future textbox: " + future_text);

      log_timestamp_to_azure('ts_clicked_final_submit_button')

      // add everything back so it's submitted to mturk
      $('form#future_form').append('<input type=hidden name="future_choice" value="' + future_choice + '" />');
      $('form#future_form').append('<input type=hidden name="future_text" value="' + future_text + '" />');
      $('form#future_form').append('<input type=hidden name="ts_submitted_" value="' + ts_submitted + '" />');

      // submit, finally!
      _this.unbind('submit').submit();
    });

    // show the final submit page
    $("#future").show();

    log_timestamp_to_azure('ts_started_final_submit_page');
  });
}

// END for gif steps


function log_is_same_dataset(){
    is_same_dataset_choice = $("input[name='optradio1']:checked").val();
    logger("choice: " + is_same_dataset_choice);
    return true;
}



function log_explanation(){

  ts_explain_end = getDateTime();
  logger("ts_explain_end: " + ts_explain_end);

  explanation_text = $("input[name='explain_opt']:checked").val();
  logger("explanation choice: " + explanation_text);
  written_explanation = $("textarea#explanation").val();
  logger("explanationtext: " + written_explanation);
  selected_answer_position = question_choice_order[explanation_text];
  question_choice_order = JSON.stringify(question_choice_order).replace(/"/g, "'");
  return true;
}

var answer_choices = {
  "non-grads-on-right" : "People with neither master's nor PhDs are factored into the right chart, which biases the averages in opposing directions.",
  "mystery-work-on-left" : "The chart on the left includes salaries from people who work in neither industry nor academia and who are unrepresentative of the general trend.",
  "many-industry-on-right" : "In the right chart, there are many kinds of industry jobs, but fewer kinds of academic jobs.",
  "outliers-drive-up-masters" : "Due to outliers, the master's point on the left chart can be higher than both master's points on the right chart.",
  "left-not-stat-sig" : "The differences in the left chart are not statistically significant and therefore could be due to chance.",
  "left-more-than-right": "The left chart shows data from more respondents than the right chart, so it is not appropriate to compare the two charts.​​",
  //"right-averages-left-pure" : "The right chart shows the averages of averages, while the left chart shows only pure averages, making them inappropriate to compare.",
  "more-masters-in-industry" : "Most people with a master's degree work in industry, which pays more and drives up the average master's salary in the left chart.",
  "none-of-the-above" : "None of the above explain the difference.​"
}

function set_up_choices() {
  var explain_radio_list = document.getElementById('explain_radio_list');

  // Create random order for radio buttons to be added
  var answer_choice_indexes = [];
  for (var i = 0; i < Object.keys(answer_choices).length - 1; i++) {
    answer_choice_indexes.push(i);
  }
  answer_choice_indexes = shuffle(answer_choice_indexes);
  answer_choice_indexes.push(Object.keys(answer_choices).length - 1); //this way 'none of the above' is always on the bottom

  // Create radio buttons and append them
  for (var i = 0; i < Object.keys(answer_choices).length; i++) {

    /// (Answer Choice Index)
    var aci = answer_choice_indexes[i];

    question_choice_order[Object.keys(answer_choices)[aci]] = i;

    var radio_div = document.createElement("div");
    var radio_label = document.createElement("label");
    var radio_input = document.createElement("input");

    radio_div
      .setAttribute("class", "radio");

    var radio_input_attributes = {"type" : "radio",
                              "name" : "explain_opt",
                              "value" : Object.keys(answer_choices)[aci]
    }

    for(var key in radio_input_attributes) {
      radio_input.setAttribute(key, radio_input_attributes[key]);
    }

      explain_radio_list.appendChild(radio_div)
        .appendChild(radio_label)
        .appendChild(radio_input)
        .parentElement
        .appendChild(document.createTextNode(Object.values(answer_choices)[aci]));
  }
}

// generate fake assignment_id, worker_id, and hit_id
function create_test_assignment() {
    var characters = 'ABCDEFGHIJoKLMNOPQRSTUVWXYZ0123456789';
    characters = characters.split('');

    suffix = shuffle(characters).slice(0, 12).join('');

    return {assignmentId: 'ASSIGNMENT_' + suffix,
	    hitId: 'HIT_' + suffix,
	    turkSubmitTo: 'https://workersandbox.mturk.com',
	    workerId: 'WORKER_' + suffix};
}


/* HELPER FUNCTIONS BELOW */

function logger(msg) {
  if (DEBUG_STATE){
    console.log(msg);
  }
}

// http://stackoverflow.com/a/19176102/76259
function getDateTime() {
    var now     = new Date();
    var year    = now.getFullYear();
    var month   = now.getMonth()+1;
    var day     = now.getDate();
    var hour    = now.getHours();
    var minute  = now.getMinutes();
    var second  = now.getSeconds();
    if(month.toString().length == 1) {
        var month = '0'+month;
    }
    if(day.toString().length == 1) {
        var day = '0'+day;
    }
    if(hour.toString().length == 1) {
        var hour = '0'+hour;
    }
    if(minute.toString().length == 1) {
        var minute = '0'+minute;
    }
    if(second.toString().length == 1) {
        var second = '0'+second;
    }
    var dateTime = year+'-'+month+'-'+day+' '+hour+':'+minute+':'+second;
     return dateTime;
}

function shuffle(n){for(var t,e,r=n.length;r;)e=0|Math.random()*r--,t=n[r],n[r]=n[e],n[e]=t;return n}
