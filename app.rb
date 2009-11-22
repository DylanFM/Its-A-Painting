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
  if @painting
    @title = "called &ldquo;#{@painting.name}&rdquo;"
    haml :"paintings/show"
  else
    not_found()
  end
end

post '/paintings/:id/history/update' do
  painting = Painting.get(params[:id])
  if painting
    painting.actions.all.destroy!
    errors = []
    history = JSON(params[:history])
    history.each do |a|
      action = Action.new
      action.steps = a.to_json
      action.painting_id = painting.id
      if !action.save
        errors += action.errors
      end
    end
    if errors.empty?
      "Painting history saved"
    else
      "Painting history was not saved: #{painting.errors.inspect}"
    end
  else
    not_found()
  end
end

get '/paintings/:id/history' do
  painting = Painting.get(params[:id])
  if painting
    painting.history
  else
    not_found()
  end
end
