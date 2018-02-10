import re

s = """
Title:          Hello_-_Adele
Creator:        MuseScore Version: 2.0.2
Producer:       Qt 5.4.2
CreationDate:   Tue Oct 27 08:12:57 2015
Tagged:         no
UserProperties: no
Suspects:       no
Form:           none
JavaScript:     no
Pages:          8
Encrypted:      no
Page size:      595 x 842 pts (A4)
Page rot:       0
File size:      166991 bytes
Optimized:      no
PDF version:    1.4
"""
regex = r"Pages:\s*([0-9]*)"


print(re.search(regex, s, re.MULTILINE).group)
print(re.findall(regex, s)[0])