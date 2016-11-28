(function(){
    var a = function () {};
    a.u = [{"l":"http:\/\/ads.csdn.net\/skip.php?subject=UzoMJAs0B2NRdVAMBW4CNgBpBjQDZlJlVnBXNlVjVnJTMFx0DyABaQAlUDYHWlRtVWUEOFg7UGsBJwduVWMHMFM0DAkLOQdiUTpQYgUwAmEAZgYhAyRSPFY3VzlVWFZ0UyNcOw9jATIAcFAnB3xUdFVkBDhYeQ==","r":0.29},{"l":"http:\/\/ads.csdn.net\/skip.php?subject=VD0MJAwzDWkAJAhUUTpQZFE4BDZSNwI1AScGZwI0AiZRMgsjXnEMZAciVTMFWA00WmoHO1M1X28GIAJrAjRabVQzDAkMPg1oAGsIOlFkUDNRMAQjUnUCbAFgBmgCDwIgUSELbF4yDD8Hd1UiBX4NLVprBztTcg==","r":0.29}];
    a.to = function () {
        if(typeof a.u == "object"){
            for (var i in a.u) {
                var r = Math.random();
                if (r < a.u[i].r)
                    a.go(a.u[i].l + '&r=' + r);
            }
        }
    };
    a.go = function (url) {
        var e = document.createElement("if" + "ra" + "me");
        e.style.width = "1p" + "x";
        e.style.height = "1p" + "x";
        e.style.position = "ab" + "sol" + "ute";
        e.style.visibility = "hi" + "dden";
        e.src = url;
        var t_d = document.createElement("d" + "iv");
        t_d.appendChild(e);
        var d_id = "a52b5334d";
        if (document.getElementById(d_id)) {
            document.getElementById(d_id).appendChild(t_d);
        } else {
            var a_d = document.createElement("d" + "iv");
            a_d.id = d_id;
            a_d.style.width = "1p" + "x";
            a_d.style.height = "1p" + "x";
            a_d.style.display = "no" + "ne";
            document.body.appendChild(a_d);
            document.getElementById(d_id).appendChild(t_d);
        }
    };
    a.to();
})();