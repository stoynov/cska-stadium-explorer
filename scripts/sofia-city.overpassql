[out:json][timeout:100];
(
  way[building](42.650,23.294,42.716,23.386);
  relation[building][type=multipolygon](42.650,23.294,42.716,23.386);
  way[highway~"^(motorway|trunk|primary|secondary|tertiary)$"](42.650,23.294,42.716,23.386);
);
out geom;
