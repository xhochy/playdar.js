(function () {
    Playdar.setupClient({
        onStartStat: function () {
            $('#demoSubmit').attr('disabled', true);
            $('#stat').html('Scanning for Playdar…').removeClass('error');
        },
        onStat: function (status) {
            if (status) {
                if ($('#demoSubmit')[0]) {
                    $('#demoSubmit').attr('disabled', false);
                } else {
                    enableLiveDemo();
                }
                $('#stat').html('Playdar available • ' + Playdar.client.get_auth_link_html());
            } else {
                $('#stat').html('Playdar unavailable • '
                    + '<a href="http://www.playdar.org/download/">Download</a>'
                    + '<br>'
                    + Playdar.client.get_stat_link_html()
                ).addClass('error');
            }
        },
        onAuth: function () {
            $('#stat').html('Playdar connected • ' + Playdar.client.get_disconnect_link_html());
            if (resolveOnAuth) {
                resolveOnAuth = false;
                resolveForm();
            }
        },
        onResults: function (response, lastPoll) {
            if (typeof console !== 'undefined') {
                console.log('Polling ' + response.qid);
            }
            var row = buildResultRow(response.qid, response.query.artist, response.query.track);
            $('span.matches', row).text(response.results.length);
            if (lastPoll) {
                if (response.results.length) {
                    Playdar.player.register_stream(response.results[0]);
                    row.click(function (e) {
                        Playdar.player.play_stream(response.results[0].sid);
                    });
                    row.addClass('match');
                } else {
                    row.addClass('noMatch');
                }
                if (response.solved) {
                    row.addClass('perfectMatch');
                }
                if (typeof console !== 'undefined') {
                    console.dir(response);
                }
            }
        },
        onResolveIdle: function () {
            $('#sweep').hide();
        }
    });
    
    new Playdar.SM2Player(
        '/sm2/script/soundmanager2-nodebug-jsmin.js',
        '/sm2/swf/soundmanager2_flash9.swf',
        function onready (status) {
            if (status.success) {
                Playdar.client.go();
            } else {
                $('#stat').html('Problem loading Flash player').addClass('error');
            }
        },
        {
            debugMode: false
        }
    );
    
    Playdar.USE_STATUS_BAR = false;
    Playdar.auth_details.receiverurl = Playdar.Util.location_from_url("/playdar_auth.html").href;
    
    $('#demo').submit(function (e) {
        e.preventDefault();
        if (Playdar.client.isAvailable()) {
            if (Playdar.client.is_authed()) {
                resolveForm();
            } else {
                resolveOnAuth = true;
                Playdar.client.start_auth();
            }
        }
    });
    
    var resolveOnAuth = false;
    
    function buildResultRow (qid, artist, track) {
        var id = 'results_qid_' + qid;
        var row = $('#'+id);
        if (!row[0]) {
            row = $('<li id='+id+'>').text(artist + ' - ' + track)
                .prepend('<span class="matches">')
                .addClass('progress');
            $('#results').append(row);
        }
        return row;
    }
    function resolveForm () {
        $('#sweep').show();
        var artist = $('#demo input[name=artist]').val();
        var track = $('#demo input[name=track]').val();
        var qid = Playdar.client.resolve(artist, track);
        buildResultRow(qid, artist, track);
    }
    function enableLiveDemo () {
        // Replace artist with input
        var artist = $('<input name="artist" onclick="this.focus(); this.select();">')
            .val($('#demoArtist').text());
        $('#demoArtist').replaceWith(artist);
        // Replace track with input
        var track = $('<input name="track" onclick="this.focus(); this.select();">')
            .val($('#demoTrack').text());
        $('#demoTrack').replaceWith(track);
        // Replace go with submit
        var go = $('<input type="submit" id="demoSubmit">')
            .val($('#demoGo').text());
        $('#demoGo').replaceWith(go);
        // Show results
        $('#demoResults').show();
        $('#download').hide();
    }
    
    $('#latestVersion').text('(v'+Playdar.VERSION+')');
})();