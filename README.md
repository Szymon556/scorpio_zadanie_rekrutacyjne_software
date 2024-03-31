# Strona Internetowa posiadjąca interfejs graficzny do kontroli silników
#żeby użyć
Skrypt uruchamiający rosbridge został dodany do pliku launch. Wystarczy uruchomić:
"roslaunch virtual_dc_motor virtual_dc_motor.launch"

gui.html odpowiada za widok strony, logika strony jest w pliku script. Trzeba nacisnąć przycisk "Closed" w prawym górnym rogu żeby połączyć się za pomocą ros.connect().Przycisk informuje o aktualnym stanie połączenia.

Przycisk Stop/GO ('Go to zero'), ktory wyprostowyuje cala konstrukcje 3 silnikow rowniez, ustawia 'Power' na 0 wplywajac na pozostale animacje, oraz zatrzymujac silnik na pozycji zastnej. 
