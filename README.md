# figchild
_figchild: Figures for Creating Children's Activities_

This package was created with the aim of facilitating the work of Elementary School teachers who need to create colorful and attractive activities for their students. It is a product of the Computational Mathematics discipline offered at the Federal University of Viçosa – Campus UFV – Florestal by professor Fernando de Souza Bastos. At the time, professor Fernando was a faculty member at the UFV Florestal campus. Currently, he is a professor in the Department of Statistics at the UFV main campus in Viçosa. The package makes use of the TikZ and xcolor packages and others.

**Current version:** v3.1.3

## Upcoming changes:

### Fixed in v3.1.3

* **The default stroke is no longer set globally:**
  Earlier versions set `every path` for the whole document, so the style
  leaked into every `tikzpicture`, including those from other packages.
  Because `\clip` then received `draw`, unrelated figures failed with
  *Extra options not allowed for clipping path command*. The default stroke
  (`line width=0.5pt, draw=black`) is now applied inside each figure, through
  `execute at begin picture`, and nothing is set outside the figures.

* **`\fcMouse` and `\fcCarrot` are drawn again:**
  Both opened a second option group, `[...][scale=0.01]`, which TikZ never
  reads. The scale was silently dropped and the figures were drawn far
  outside the page, so they simply did not appear — with no error in the log.
  Forty other figures carried a stray closing bracket, harmless but now
  removed as well.

* **Accented characters in the source:**
  Comments had been double-encoded in v3.1.2; they are proper UTF-8 again.

### What's New in This Version

* **Full TikZ Options Support:**
  All TikZ options can now be applied directly by including them inside square brackets after the figure command (e.g., `\fcAbajourA[scale=0.5, rotate=45]`). This makes it easier to customize figures while maintaining compatibility with standard TikZ syntax.

* **Corrections and Enhancements:**
  Several figures have been revised and corrected to improve visual accuracy and consistency.

* **Greater Flexibility:**
  This version increases the overall versatility of the package, allowing users to seamlessly integrate figures with various TikZ styles and transformations.

* **Backward Compatibility:**
  All previously available figure commands and options remain fully functional, ensuring a smooth update process for existing documents.

* **Improved Documentation:**
  The updated documentation now includes detailed examples and explanations for advanced usage.


## Authors: 

Fernando de Souza Bastos, Guilherme Fernandes Castro de Oliveira, José Vitor Novaes Moreira, Jéssica de Mendonça, Gabriel Singh Bruno, Matheus Iago Teixeira da Silva, Erlane Alves Santiago, Ana Carolina de Assis Coelho, Lucas Mendes Viana, Dhavy Alexwander Lopes dos Santos, Vitória Augusta Dutra de Castro Soares, Júlia Letícia Gonçalves Martins, Kethile Alves Fagundes, Luan Moises dos Santos Valadares, Luiz Henrique de Souza Matos, Warley Ribeiro de Freitas, Paula Alves de Freitas, Janaíne Geralda Mesquita Martins, Henrique Ribeiro Diniz

## Maintainer: 

Fernando de Souza Bastos

## E-mail: 

fernando.bastos@ufv.br

## License

Copyright 2026 by Fernando de Souza Bastos <fernando.bastos@ufv.br>.

Released under the LaTeX Project Public License v1.3c or later. See http://www.latex-project.org/lppl.txt 


Feature requests, issues and pull requests are welcome.