#!/bin/bash

# Create docs
cd lib
docco controls.js frame.js presenter.js presentation.js worker.js pik.js print.js
cd ../plugins
docco backgroundHarmonizer.js inputProtector.js printHandout.js
