from django.test import TestCase

from .views import parseScheduleNumberCell, findIndexOfMultiplierOrFalse, getScheduleNumberWithMultiplier

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

    def test_parseScheduleNumberCell_IfInputIsNumbersAndLetters_DoesNotTransformTheInput(self):
        input = 'A1'
        actualOutput = parseScheduleNumberCell(input)
        expectedOutput = 'A1'
        self.assertEqual(actualOutput, expectedOutput)

    def test_parseScheduleNumberCell_IfInputContainsSpaces_DoesNotTransformTheInput(self):
        input = 'A 1'
        actualOutput = parseScheduleNumberCell(input)
        expectedOutput = 'A 1'
        self.assertEqual(actualOutput, expectedOutput)

    def test_parseScheduleNumberCell_IfInputIsNaN_ReturnsNbsp(self):
        input = float("nan")
        actualOutput = parseScheduleNumberCell(input)
        expectedOutput = "&nbsp;"
        self.assertEqual(actualOutput, expectedOutput)

    def test_findIndexOfMultiplierOrFalse_IfInputContainsx_ReturnIndex(self):
        input = "ABCx123"
        actualOutput = findIndexOfMultiplierOrFalse(input)
        expectedOutput = 3
        self.assertEqual(actualOutput.start(), expectedOutput)

    def test_findIndexOfMultiplierOrFalse_IfInputContainsX_ReturnIndex(self):
        input = "ABCX123"
        actualOutput = findIndexOfMultiplierOrFalse(input)
        expectedOutput = 3
        self.assertEqual(actualOutput.start(), expectedOutput)

    def test_findIndexOfMultiplierOrFalse_IfInputContainsX_ExcludeCharactersAfterMultiplier(self):
        input = "ABC 123 x2 *"
        actualOutput = findIndexOfMultiplierOrFalse(input)
        expectedOutput = 10
        self.assertEqual(actualOutput.end(), expectedOutput)

    def test_findIndexOfMultiplierOrFalse_IfInputDoesNotContainX_ReturnNonetype(self):
        input = "ABC 123"
        actualOutput = findIndexOfMultiplierOrFalse(input)
        expectedOutput = None
        self.assertEqual(actualOutput, expectedOutput)

    def test_findScheduleNumberAndMultiplier_IfInputContainsXFollowedByInteger_ReturnScheduleNumberAndMultiplier(self):
        input = "ABC 123 x2 *"
        actualOutput = getScheduleNumberWithMultiplier(input)
        expectedOutput = "ABC 123"
        self.assertEqual(actualOutput[0], expectedOutput)

        expectedOutput = 2
        self.assertEqual(actualOutput[1], expectedOutput)

    def test_findScheduleNumberAndMultiplier_IfInputContainsXFollowedByFraction_ReturnScheduleNumberAndMultiplier(self):
        input = "ABC 123 x2.7 *"
        actualOutput = getScheduleNumberWithMultiplier(input)
        expectedOutput = "ABC 123"
        self.assertEqual(actualOutput[0], expectedOutput)

        expectedOutput = 2.7
        self.assertEqual(actualOutput[1], expectedOutput)
