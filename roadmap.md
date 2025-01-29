
https://www.theparisreview.org/blog/2017/02/15/rhythmical-lines/


Publisher is a stream of tokens

F+F+F+F
 
Send F      Judges the fitness, Take some measurements
Send +      Judges the fitness
Send F      to some "judger" --> Judges the fitness

How can we judge?
We can judge each step by asking "Does this intersect with a previous line?"


Send 
....
Complete

Once complete we can have a set of metrics which judge the entire shape

We're interested in "compactness"

1) Measure the total area of the shape 
2) We can measure the relationship between X range and Y range

There's a difficulty here with iterations! The behavior might be diff depending on iterated vs axiom


Generate a bunch of “programs” [“p1", “p2", “p3”, ...]
Judge each program [f1, f2, f3]
Do the genetic algorithm thingie
Sort by fitness, take top n
Do some sort of munging
Goto 2

(Every second, render the fittest program)

Fitness:
Lines do not cross
Fits into a bounding box
“Compact”?