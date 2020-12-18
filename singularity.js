
/*
  'Singularity'
  @TskukamotoHideki
  2020
*/

let data = [];
let buffer_size = 1024;
let line_color = 0;

let canvas;
let context;
let noise;

function remap(n, start1, stop1, start2, stop2) 
{
  return ((n-start1)/(stop1-start1))*(stop2-start2)+start2;
}

function evaluate(n, metadata)
{
  let meta = 
  {
    'description': "",
    'prob': 0
  }

  let points =
  {
    'form': 0,
    'rare': 0
  }

  if(n==1.0)
  {
    meta.desciption = "absolute";
    points.rare = 2;
    points.form = 7;
    meta.prob = 0.001;
  } 
  else if(n==0.0)
  {
    meta.desciption = "void";
    points.rare = 2;
    points.form = 7;
    meta.prob = 0.001;
  }
  else if(n <= 0.01)                   
  {
    meta.desciption = "minimal";
    points.rare = 1;
    points.form = 5;
    meta.prob = 0.01;
  }
  else if (n > 0.01 && n < 0.1)  
  {
    meta.desciption = "marginal";     
    points.form = 3;  
    meta.prob = 0.09;    
  }
  else if (n > 0.1 && n < 0.25) 
  {
    meta.desciption = "low";    
    points.form = 1;              
    meta.prob = 0.15;    
  }
  else if (n > 0.99)                   
  {
    meta.desciption = "extreme"; 
    points.rare = 1;
    points.form = 5;
    meta.prob = 0.01;
  }
  else if (n < 0.99 && n > 0.9)  
  {
    meta.desciption = "super";     
    points.form = 3;   
    meta.prob = 0.09;    
  }
  else if (n < 0.90 && n > 0.75) 
  {
    meta.desciption = "high";  
    points.form = 1;    
    meta.prob = 0.15;      
  }
  else 
  {
    meta.desciption = "average";
    meta.prob = 0.5; 
  }

  return metadata ? meta : points;
}


function generate_metadata(formdata) 
{
  let meta_mass = evaluate(formdata.mass, true);
  let meta_force = evaluate(formdata.force, true);
  let meta_symmetry = evaluate(formdata.symmetry, true);
  let meta_turbulence = evaluate(formdata.turbulence, true);
  let meta_chaos = evaluate(formdata.chaos, true);

  let form_metadata =
  {
    "mass":             formdata.mass,
    "mass_level":       meta_mass.desciption,
    "force":            formdata.force,
    "force_level":      meta_force.desciption,
    "symmetry":         formdata.symmetry,
    "symmetry_level":   meta_symmetry.desciption,
    "turbulence":       formdata.turbulence,
    "turbulence_level": meta_turbulence.desciption,
    "chaos":            formdata.chaos,
    "chaos_level":      meta_chaos.desciption,
    "prob":             meta_mass.prob * meta_force.prob * meta_symmetry.prob * meta_turbulence.prob * meta_chaos.prob   
  };

  return form_metadata;
}

const lerp_colour = function(a, b, amount) 
{
    const ar = a >> 16,
          ag = a >> 8 & 0xff,
          ab = a & 0xff,

          br = b >> 16,
          bg = b >> 8 & 0xff,
          bb = b & 0xff,

          rr = ar + amount * (br - ar),
          rg = ag + amount * (bg - ag),
          rb = ab + amount * (bb - ab);

    return (rr << 16) + (rg << 8) + (rb | 0);
};

function three_point_gradient(x, start, mid, end) 
{
    return (x < 0.5) ?  lerp_colour(start, mid, remap(x, 0.0, 0.5, 0.0, 1.0)):
                        lerp_colour(mid,   end, remap(x, 0.5, 1.0, 0.0, 1.0));
}

function sq(number)
{
  return Math.pow(number, 2)
}

function lerp (start, end, amt)
{
  return (1-amt)*start+amt*end
}

function process_formdata(hashdata) 
{
  let idx_mass = 1;
  let idx_aperture = 2;
  let idx_force   = 3;
  let idx_symmetry = 4;
  let idx_turbulence = 5;
  let idx_chaos = 6;
  let idx_saturation = 7;

  let formdata = 
  {
    'mass':         hashdata[idx_mass],
    'aperture':     hashdata[idx_aperture],
    'force':        hashdata[idx_force],
    'symmetry':     hashdata[idx_symmetry],
    'turbulence':   hashdata[idx_turbulence],
    'chaos':        hashdata[idx_chaos],
    'saturation':   hashdata[idx_saturation]
  };

  return formdata;
}

function evaluate_points(fd)
{
    let points_mass       = evaluate(fd.mass, false);
    let points_force      = evaluate(fd.force, false);
    let points_symmetry   = evaluate(fd.symmetry, false);
    let points_turbulence = evaluate(fd.turbulence, false);
    let points_chaos      = evaluate(fd.chaos, false);

    let points =
    {
      'form': points_mass.form + 
              points_force.form + 
              points_symmetry.form + 
              points_turbulence.form + 
              points_chaos.form,
 
      'rare': points_mass.rare + 
              points_force.rare + 
              points_symmetry.rare + 
              points_turbulence.rare + 
              points_chaos.rare
    };

    return points;
}

function generate_renderdata(fd) 
{
  let points = evaluate_points(fd);

  let renderdata = 
  {
    'mass':         lerp(128.0,  900.0,  fd.mass),
    'aperture':     lerp(24.00,  196.0,  fd.aperture),
    'force':        lerp(256.0,  700.0,  fd.force),
    'symmetry':     1.0-fd.symmetry,
    'turbulence':   lerp(0.000,  1.600,  fd.turbulence),
    'chaos':        lerp(0.001,  0.01,   fd.chaos), 
    'saturation':   fd.saturation,
    'form_points':  points.form,
    'rare_points':  points.rare
  };

  return renderdata;
}

function process_hash(txn)
{
  let hash_index = 0;

  for (let i = 2; i < 65; i += 2) 
  {
    let from = i;
    let to = i + 2;
    let s = txn.substring(from, to);

    data[hash_index] = parseInt(s, 16) / 255.0;

    hash_index++;
  }

  return data;
}

function init(txn)
{ 
  noise = new Noise().noiseDetail(10);
  noise.noiseSeed(3);

  line_color = 0xfffad7;
  canvas = document.querySelector("canvas");
  canvas.width = 1024;
  canvas.height =1024;

  context = canvas.getContext("2d");

  context.fillStyle = '#000000';
  context.fillRect(0, 0, 1024, 1024);
  
  let hashdata    = process_hash(txn);
  let formdata    = process_formdata(hashdata);

  let renderdata  = generate_renderdata(formdata);

  render(renderdata);

  let metadata    = generate_metadata(formdata);
  return metadata;
}

function render(rd)
{
  for (let i = 0; i < rd.mass; i++) 
  {
    let norm_inc = sq(i / rd.mass);
    let ring_rad = rd.aperture + (i * 0.01);
    let current_force = rd.force * norm_inc;
    let alfa = 255.0 - (norm_inc * 255.0);
    let alpha = parseInt(alfa);
    let norm_turb = rd.turbulence * norm_inc;

    let g, start, middle, end, sat;

    switch(rd.rare_points)
    {
      case 0:
        start = 0xffad77;
        mid   = 0xf91362;
        end   = 0x35126a;
      break;   
      case 1:
        start = 0xcffff0;
        mid   = 0x6096db;
        end   = 0x20fbbc;
      break;       
      case 2:
        start = 0xfffcc8;
        mid   = 0xfacc22;
        end   = 0xf83600;
      break;
      default:
        start = 0x73d055;
        mid   = 0x1f968B;
        end   = 0x440154;
      break;
    }

    g = three_point_gradient(norm_inc, start, mid, end);

    if (rd.form_points == 0) 
    {
      sat = 0.0;
    } else if (rd.form_points > 0 && rd.form_points < 7) 
    {
      sat = lerp(0.0, 0.25, rd.saturation);
    } else if (rd.form_points >= 7 && rd.form_points < 9) 
    {
      sat = lerp(0.2, 0.75, rd.saturation);
    } else if (rd.form_points >= 9 && rd.form_points < 10) 
    {
      sat = lerp(0.75, 0.9, rd.saturation);
    } else if (rd.form_points >= 10 && rd.form_points < 11) 
    {
      sat = lerp(0.9, 1.0, rd.saturation);
    } else 
    {
      sat = 1.0;
    }

    let col = lerp_colour(line_color, g, sat);

    let ang = (Math.PI * 2.0) / 500.0;

    context.beginPath();

    for (let j = 0; j <= 500; j++) 
    {
      let theta = ang * j;
      let ct = Math.cos(theta);
      let st = Math.sin(theta);
      let sample_x = ct + rd.symmetry;
      let sample_y = st + rd.symmetry;
      let ken = get_noise(norm_turb * sample_x, norm_turb * sample_y, (i * rd.chaos));

      let current_aperture = ring_rad + ken * current_force;
      let x = (buffer_size/2) + current_aperture * ct;
      let y = (buffer_size/2) + current_aperture * st;

      context.lineTo(x, y);

    /*
      Individial lines. Not a single stroke with vertices.
      Gives a grided, mesh like appearence as alpha builds.
    */

    }

    context.strokeStyle = '#' + col.toString(16) + alpha.toString(16);
    context.stroke();
  }

  context.translate(0.5, 0.5);
}

function get_noise(x, y, z)
{
  var v = noise.get(x, y, z);

  return v;
}

/*
  Rune Madsen's Noise
  https://github.com/runemadsen/rune.noise.js/blob/master/src/noise.js
*/

var PERLIN_YWRAPB = 4;
var PERLIN_YWRAP = 1<<PERLIN_YWRAPB;
var PERLIN_ZWRAPB = 8;
var PERLIN_ZWRAP = 1<<PERLIN_ZWRAPB;
var PERLIN_SIZE = 4095;

var SINCOS_PRECISION = 0.5;
var SINCOS_LENGTH = Math.floor(360 / SINCOS_PRECISION);
var sinLUT = new Array(SINCOS_LENGTH);
var cosLUT = new Array(SINCOS_LENGTH);
var DEG_TO_RAD = Math.PI/180.0;

for (var i = 0; i < SINCOS_LENGTH; i++) 
{
  sinLUT[i] = Math.sin(i * DEG_TO_RAD * SINCOS_PRECISION);
  cosLUT[i] = Math.cos(i * DEG_TO_RAD * SINCOS_PRECISION);
}

var perlin_PI = SINCOS_LENGTH;
perlin_PI >>= 1;

var Noise = function() 
{
  this.perlin_octaves = 4; 
  this.perlin_amp_falloff = 0.5; 
  this.perlin = null;
}

Noise.prototype = {

  noiseDetail: function(lod, falloff) {
    if (lod>0)     { this.perlin_octaves = lod; }
    if (falloff>0) { this.perlin_amp_falloff = falloff; }
    return this;
  },

  noiseSeed: function(seed) 
  {
    var lcg = (function() {
      var m = 4294967296,
      a = 1664525,
      c = 1013904223,
      seed, z;
      return {
        setSeed : function(val) {
          z = seed = (val == null ? Math.random() * m : val) >>> 0;
        },
        getSeed : function() {
          return seed;
        },
        rand : function() {
          z = (a * z + c) % m;
          return z / m;
        }
      };
    }());

    lcg.setSeed(seed);
    this.perlin = new Array(PERLIN_SIZE + 1);
    for (var i = 0; i < PERLIN_SIZE + 1; i++) {
      this.perlin[i] = lcg.rand();
    }
    return this;
  },

  get: function(x,y,z) {

    y = y || 0;
    z = z || 0;

    if(this.perlin == null) {
      this.perlin = new Array(PERLIN_SIZE + 1);
      for (var i = 0; i < PERLIN_SIZE + 1; i++) {
        this.perlin[i] = Math.random();
      }
    }

    if (x<0) { x=-x; }
    if (y<0) { y=-y; }
    if (z<0) { z=-z; }

    var xi=Math.floor(x), yi=Math.floor(y), zi=Math.floor(z);
    var xf = x - xi;
    var yf = y - yi;
    var zf = z - zi;
    var rxf, ryf;

    var r=0;
    var ampl=0.5;

    var n1,n2,n3;

    var noise_fsc = function(i) 
    {
      return 0.5*(1.0-cosLUT[Math.floor(i*perlin_PI)%SINCOS_LENGTH]);
    };

    for (var o=0; o<this.perlin_octaves; o++) {
      var of=xi+(yi<<PERLIN_YWRAPB)+(zi<<PERLIN_ZWRAPB);

      rxf= noise_fsc(xf);
      ryf= noise_fsc(yf);

      n1  = this.perlin[of&PERLIN_SIZE];
      n1 += rxf*(this.perlin[(of+1)&PERLIN_SIZE]-n1);
      n2  = this.perlin[(of+PERLIN_YWRAP)&PERLIN_SIZE];
      n2 += rxf*(this.perlin[(of+PERLIN_YWRAP+1)&PERLIN_SIZE]-n2);
      n1 += ryf*(n2-n1);

      of += PERLIN_ZWRAP;
      n2  = this.perlin[of&PERLIN_SIZE];
      n2 += rxf*(this.perlin[(of+1)&PERLIN_SIZE]-n2);
      n3  = this.perlin[(of+PERLIN_YWRAP)&PERLIN_SIZE];
      n3 += rxf*(this.perlin[(of+PERLIN_YWRAP+1)&PERLIN_SIZE]-n3);
      n2 += ryf*(n3-n2);

      n1 += noise_fsc(zf)*(n2-n1);

      r += n1*ampl;
      ampl *= this.perlin_amp_falloff;
      xi<<=1;
      xf*=2;
      yi<<=1;
      yf*=2;
      zi<<=1;
      zf*=2;

      if (xf>=1.0) { xi++; xf--; }
      if (yf>=1.0) { yi++; yf--; }
      if (zf>=1.0) { zi++; zf--; }
    }
    return r;
  }
}

init(tokenData.hash);