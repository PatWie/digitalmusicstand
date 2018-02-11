find . -name '*.pdf' | while read line; do
    echo ${line%.pdf}
    echo ${line%.pdf}.cpdf

    gs -q -dSAFER -dNOPAUSE -dBATCH -sDEVICE=pdfwrite \
    -sOutputFile=${line%.pdf}.cpdf -dCompatibilityLevel=1.5 \
    -dPDFSETTINGS=/ebook -c .setpdfwrite -f ${line}
done



# gs -q -dSAFER -dNOPAUSE -dBATCH -sDEVICE=pdfwrite \
#     -sOutputFile=Alexandre-Desplat_Harry-Potter-and-the-Deathly-Hallows-Part-1.cpdf -dCompatibilityLevel=1.5 \
#     -dPDFSETTINGS=/screen -c .setpdfwrite -f Alexandre-Desplat_Harry-Potter-and-the-Deathly-Hallows-Part-1.pdf