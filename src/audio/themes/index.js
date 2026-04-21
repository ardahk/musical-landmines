import scifi from './scifi'
import nature from './nature'
import underwater from './underwater'
import horror from './horror'
import medieval from './medieval'
import retro from './retro'

export const themesList = [scifi, nature, underwater, horror, medieval, retro]

export const themeMap = themesList.reduce((acc, theme) => {
  acc[theme.key] = theme
  return acc
}, {})
