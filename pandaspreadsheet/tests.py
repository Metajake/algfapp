from django.test import TestCase
from .views import parseScheduleNumberCell
# Create your tests here.

class PandasTests(TestCase):


    def setUp(self):
        pass

    def test_parseScheduleNumberCell_IfInputStartsWithAsterisk_DoesNotTransformTheInput(self):
        input = "*    1/3 TURN"
        actualOutput = parseScheduleNumberCell(input)
        expectedOutput = "*    1/3 TURN"
        self.assertEqual(actualOutput, expectedOutput)

    def test_parseScheduleNumberCell_IfInputIsAllLetters_DoesNotTransformTheInput(self):
        input = "A"
        actualOutput = parseScheduleNumberCell(input)
        expectedOutput = "A"
        self.assertEqual(actualOutput, expectedOutput)

    def test_parseScheduleNumberCell_IfInputIsAllNumbers_DoesNotTransformTheInput(self):
        input = "123"
        actualOutput = parseScheduleNumberCell(input)
        expectedOutput = "123"
        self.assertEqual(actualOutput, expectedOutput)

        input = 123
        actualOutput = parseScheduleNumberCell(input)
        expectedOutput = "123"
        self.assertEqual(actualOutput, expectedOutput)

    def test_parseScheduleNumberCell_IfInputIsNaN_ReturnsNbsp(self):
        input = float("nan")
        actualOutput = parseScheduleNumberCell(input)
        expectedOutput = "&nbsp;"
        self.assertEqual(actualOutput, expectedOutput)