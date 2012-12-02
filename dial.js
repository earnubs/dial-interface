YUI().use('node', 'event-move', 'event-touch', 'event-flick', function(Y) {

    var controls = Y.all('.dial li');
    controls.each(transform);


    // TODO key shortcuts, up, down, left, right, hjkl?
    // TODO gestures
    // TODO add the rotation transforms from here: Math.PI * 2 / list size
    var dial = Y.one('.dial'),
        viewer = Y.one('.viewer ul'),
        origin = dial.getXY(),
        rotation = 0,
        last = {},
        mass = 300,
        // 345 is close to 1:1 at edge
        width = dial.get('offsetWidth'),
        height = dial.get('offsetHeight'),

        originX = width / 2,
        originY = height / 2,
        xy = dial.getXY(),

        handleDrag = function(e) {

            if (e.flick) {
                console.log('flick');
                last.X = e.flick.start.pageX;
                last.Y = e.flick.start.pageY;
            }

            e.preventDefault();
            
            // why is the YUI event facade wrong?
            e.pageX = e.pageX || e.touches[0].pageX;
            e.pageY = e.pageY || e.touches[0].pageY;

            var eX = e.pageX - xy[0],
                eY = e.pageY - xy[1],
                hitX, hitY, radius, force, x1, y1, x2, y2, r, theta, dir, sign, a1, a2;

            

            // TODO fire event when in/out of circle attr changes
            // when it changes to out of circle see if we have a vector,
            // if so, use that to calculate momentum
            if (isinsidecircle(eX, eY)) {

                // translate origin, invert y axis
                hitX = (eX - originX);
                hitY = -(eY - originY);

                // check if last is defined,
                //if not return function without this if?
                if (last.X) {


                    // a and b are vectors
                    radius = [last.X, last.Y];
                    force = [hitX - last.X, hitY - last.Y];

                    x1 = originX - eX;
                    y1 = originY - eY;

                    x2 = last.X - eX;
                    y2 = last.Y - eY;

                    r = magnitude(radius);
                    theta = Math.asin(y1 / r);

                    theta *= 180 / Math.PI;

                    a1 = projection(force, radius);
                    a2 = [force[0] - a1[0], force[1] - a1[1]];

                    dir = direction(radius, force);
                    sign = dir && dir / Math.abs(dir);

                    rotation += ((sign * -1) * ((magnitude(a2) * r) / mass));

                    dial.setStyles({
                        'webkitTransform': 'rotate(' + rotation + 'deg)',
                        'transform': 'rotate(' + rotation + 'deg)'
                    });

                    viewer.setStyles({
                        'webkitTransform': 'translate(' + rotation * 8.3 + 'px)',
                        'transform': 'translate(' + rotation * 8.3 + 'px)'
                    });

                }


                last = {
                    X: hitX,
                    Y: hitY
                };
            }
        };

    dial.on('touchmove', handleDrag);
    dial.on('mousemove', handleDrag);
    dial.on('flick', handleDrag, {
        minDistance: 10,
        minVelocity: 0,
        preventDefault: true
    })
    dial.on('touchend', function(e) {
        last = {}
    });
    dial.on('mouseout', function(e) {
        last = {}
    });

    //Y.log(projection([2, 1], [-3, 4])); // assert 0.24, -0.32
    //Y.log(magnitude([3, 4])); // assert 5
    //Y.log(anglebetweenvectors([2, 3, 4], [1, -2, 3])); // assert 66.6
});

function dotproduct(a, b) {
    var n = 0,
        lim = Math.min(a.length, b.length);
    for (var i = 0; i < lim; i++) n += a[i] * b[i];
    return n;
}

function magnitude(a) {
    //return Math.sqrt(radius[0]*radius[0]+radius[1]*radius[1]);
    var n = 0,
        lim = a.length;
    for (var i = 0; i < lim; i++) n += a[i] * a[i];
    return Math.sqrt(n);
}

function projection(u, v) {
    // u on v
    var f = dotproduct(u, v) / dotproduct(v, v);
    return [(v[0] * f), (v[1] * f)];
}

function direction(u, v) {
    return (u[0] * v[1]) - (u[1] * v[0]);
};

function anglebetweenvectors(a, b) {
    return Math.acos(
    dotproduct(a, b) / (magnitude(a) * magnitude(b))) * (180 / Math.PI);
};

function isinsidecircle(x, y) {
    var cx = cy = radius = 150,
        a = ((x - cx) * (x - cx)) + ((y - cy) * (y - cy)),
        b = (radius * radius);
    return (a < b);
};

function degminsec(deg) {
    var degInt = ~~deg,
        min = 60 * (deg - degInt),
        minInt = ~~min,
        sec = 60 * (min - minInt);
    return [degInt, minInt, sec];
}


function transform(node, index, list) {
    var rotation = 360/list.size() * index;
    node.setStyles({
        'webkitTransform': 'rotate(' + rotation + 'deg)',
        'transform': 'rotate(' + rotation + 'deg)'
    });
}
