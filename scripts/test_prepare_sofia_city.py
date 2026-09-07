"""Offline extractor regression tests: python3 -m unittest discover -s scripts."""
import importlib.util
from pathlib import Path
import unittest

spec = importlib.util.spec_from_file_location('city', Path(__file__).with_name('prepare-sofia-city.py'))
city = importlib.util.module_from_spec(spec)
spec.loader.exec_module(city)


class CityExtractionTest(unittest.TestCase):
    def test_height_units_levels_and_honest_fallback(self):
        self.assertEqual(city.building_height({'height': '24 m', 'building:levels': '2'}), (24, 0))
        self.assertEqual(city.building_height({'height': "40'0\""}), (12.2, 0))
        self.assertEqual(city.building_height({'height': 'unknown', 'building:levels': '8'}), (26.3, 1))
        self.assertEqual(city.building_height({'building': 'garage'}), (3.5, 2))
        self.assertEqual(city.building_height({'building': 'apartments'}), (17, 2))
        self.assertEqual(city.building_height({'height': '-20'}), (11, 2))

    def test_relation_joins_reversed_segments_without_fabricating_closures(self):
        a, b, c, d = [0, 0], [10, 0], [10, 10], [0, 10]
        self.assertEqual(city.join_rings([[a, b, c], [a, d, c]]), [[a, b, c, d, a]])
        with self.assertRaises(ValueError):
            city.join_rings([[a, b, c]])

    def test_nested_courtyards_are_assigned_only_to_containing_outer(self):
        square = [[0, 0], [10, 0], [10, 10], [0, 10]]
        self.assertTrue(city.inside([5, 5], square))
        self.assertFalse(city.inside([15, 5], square))

    def test_quantization_preserves_stadium_alignment(self):
        self.assertEqual(city.project({'lat': 42.684306, 'lon': 23.339806}), [0, 0])
        point = city.project({'lat': 42.685306, 'lon': 23.339806})
        self.assertAlmostEqual(point[0], 834, delta=1)
        self.assertAlmostEqual(point[1], 734, delta=1)

    def test_budget_keeps_far_skyline_instead_of_only_nearest_buildings(self):
        footprint = [[0, 0, 100, 0, 100, 100, 0, 100]]
        near = [1, 8, 2, 1, 9000, 0, footprint]
        middle = [2, 8, 2, 1, 20000, 0, footprint]
        landmark = [3, 100, 0, 2, 40000, 0, footprint]
        self.assertEqual([b[0] for b in city.select_buildings([near, middle, landmark], 2)], [1, 3])

    def test_complete_extract_preserves_courtyard_and_deduplicates_member_way(self):
        outer = [{'lat': lat, 'lon': lon} for lat, lon in [
            (42.700, 23.350), (42.701, 23.350), (42.701, 23.351),
            (42.700, 23.351), (42.700, 23.350)]]
        hole = [{'lat': lat, 'lon': lon} for lat, lon in [
            (42.7003, 23.3503), (42.7007, 23.3503), (42.7007, 23.3507),
            (42.7003, 23.3507), (42.7003, 23.3503)]]
        raw = {'osm3s': {'timestamp_osm_base': '2026-09-07T00:00:00Z'}, 'elements': [
            {'type': 'way', 'id': 1, 'tags': {'building': 'office'}, 'geometry': outer},
            {'type': 'relation', 'id': 2, 'tags': {'building': 'office', 'height': '30 m'},
             'members': [{'type': 'way', 'ref': 1, 'role': 'outer', 'geometry': outer},
                         {'type': 'way', 'ref': 3, 'role': 'inner', 'geometry': hole}]}]}
        result = city.prepare(raw)
        self.assertEqual(len(result['buildings']), 1)
        building = result['buildings'][0]
        self.assertEqual(building[:4], [-2, 30, 0, 2])
        self.assertEqual([len(ring) for ring in building[6]], [8, 8])
        self.assertEqual(result, city.prepare(raw))


if __name__ == '__main__':
    unittest.main()
