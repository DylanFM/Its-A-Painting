require 'rubygems'
require 'sinatra'
require 'sinatra/content_for'
require 'haml'
require 'data_mapper'

require File.join(File.dirname(__FILE__), "config", "environment.rb")

Dir.glob(File.join(File.dirname(__FILE__), "lib", "*.rb")).each { |f| require f }

DataMapper.setup(:default, DATABASE_OPTIONS)

get '/' do
  @paintings = Painting.all
  haml :index
end

get '/paintings/new' do
  painting = Painting.create(:name => "It's a Masterpiece")
  redirect "/paintings/#{painting.id}"
end

get '/paintings/:id' do
  @painting = Painting.get(params[:id])
  haml :"paintings/show"
end

post '/paintings/:id/history/update' do
  painting = Painting.get(params[:id])
  if painting
    painting.history = params[:history]
    if painting.save
      "Painting history saved"
    else
      "Painting history was not saved"
    end
  else
    "Painting not found"
  end
end

get '/paintings/:id/history' do
  painting = Painting.get(params[:id])
  if painting
    painting.history
  else
    "Painting not found"
  end
end
