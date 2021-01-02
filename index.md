
**Rarity in Singularity**

A few words on rarity and how it works within the *Singularity* collection.  In Singularity project, the 'forms' are driven by a number of properties. The properties we're interested here are:

*Mass*, *Force*, *Chaos*, *Symmetry* and *Turbulence*

These values were populated by the hashes, unique to each token, making each one visually different.  The system that generates the forms works on a points based system. There are two types of points:

**Rarity Points** 
These awarded for the properties above being at the extremes. So, the system awards 2 Rarity Points for the values being at either exactly 1.0 or 0.0 (a 1 in 128 chance). It also adds a single Rarity Point for the values being within 0.01 of the min or max value (a 1 in 50 chance).

*Rarity Points define the colour gradient used by the form.*

![Rarity Level 1 . 0 Points](http://distancefields.com/singularity/gradients/gradient_a.png)

![Rarity Level 2 . 1 Point](http://distancefields.com/singularity/gradients/gradient_b.png)

![Rarity Level 3 . 2 Points](http://distancefields.com/singularity/gradients/gradient_c.png)

![Rarity Level 4 . Greater than 2 points](http://distancefields.com/singularity/gradients/gradient_d.png)


**Form Points** 
Form Points are also awarded for properties being within ranges, and are used to define 'features' within the form. They are:

*void*, *minimal*, *marginal*, *low*, *average*, *high*, *super*, *extreme* and *absolute*

*Form Points determine how saturated the colour of a form is.*

**Probability** 
There is also logic within the code to establish the chance of any given Singularity being generated.   This is derived from the probability of that form's combination of 'features' occurring , and is expressed as a fraction with a numerator of 1. *(e.g 1 in x)* 

The probability and form property ranges are all readable from the metadata.
