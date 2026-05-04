import scifi from './scifi'
import nature from './nature'
import underwater from './underwater'
import medieval from './medieval'
import retro from './retro'
import horror from './horror'

export const themesList = [scifi, nature, underwater, medieval, retro, horror]

export const themeMap = themesList.reduce((acc, theme) => {
  acc[theme.key] = theme
  return acc
}, {})
